import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Hook for browser-native speech recognition (Web Speech API).
 * Returns state and controls for a mic button.
 *
 * Supports continuous mode — keeps listening until manually stopped.
 * Falls back gracefully if the browser doesn't support the API.
 */

// Extend window for vendor-prefixed API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

type SpeechRecognitionErrorEvent = Event & { error: string; message?: string };

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

function getSpeechRecognitionConstructor(): (new () => SpeechRecognitionInstance) | null {
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export type VoiceStatus = "idle" | "listening" | "error";

interface UseVoiceInputOptions {
  /** Language/locale for recognition. Default: "en-IN" */
  lang?: string;
  /** Called with transcript chunks as they arrive (interim + final) */
  onTranscript?: (text: string, isFinal: boolean) => void;
  /** Called when a final result is produced */
  onFinalResult?: (text: string) => void;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}) {
  const { lang = "en-IN", onTranscript, onFinalResult } = options;

  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [supported, setSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (!getSpeechRecognitionConstructor()) {
      setSupported(false);
    }
  }, []);

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionConstructor();
    if (!Ctor) {
      setSupported(false);
      setErrorMessage("Speech recognition not supported in this browser.");
      return;
    }

    // Stop any existing session.
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => {
      setStatus("listening");
      setErrorMessage(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        onTranscript?.(finalTranscript, true);
        onFinalResult?.(finalTranscript);
      } else if (interimTranscript) {
        onTranscript?.(interimTranscript, false);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // "no-speech" and "aborted" are non-fatal
      if (event.error === "no-speech" || event.error === "aborted") return;
      setStatus("error");
      setErrorMessage(event.error === "not-allowed"
        ? "Microphone access denied. Please allow mic permissions."
        : `Speech error: ${event.error}`);
    };

    recognition.onend = () => {
      setStatus("idle");
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [lang, onTranscript, onFinalResult]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const toggle = useCallback(() => {
    if (status === "listening") {
      stop();
    } else {
      start();
    }
  }, [status, start, stop]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  return { status, supported, errorMessage, start, stop, toggle };
}
