import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  ArrowRight,
  Check,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Paperclip,
  Sparkles,
  Users,
  Wallet,
  AlertTriangle,
  X,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { samplePrompts } from "@/lib/mock/needspeak";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat — NeedSpeak" },
      {
        name: "description",
        content:
          "Describe what you're planning. NeedSpeak extracts intent and builds a cart in real time.",
      },
      { property: "og:title", content: "Chat — NeedSpeak" },
      {
        property: "og:description",
        content: "Context-to-Cart workspace with live intent extraction.",
      },
    ],
  }),
  component: ChatPage,
});

type Phase = "idle" | "thinking" | "cart";

// Helper: try to extract a budget number from the user's message
function extractBudget(text: string): number | undefined {
  // Match patterns like "Budget ₹1500", "budget 1500", "1500 rupees", "Rs.1500", "rs 1500", "₹1500"
  const patterns = [
    /(?:budget|budjet)\s*(?:₹|rs\.?|inr)?\s*(\d[\d,]*)/i,
    /(?:₹|rs\.?|inr)\s*(\d[\d,]*)/i,
    /(\d[\d,]*)\s*(?:rupees?|rs\.?|₹|inr)/i,
    /(?:under|within|around|roughly|about)\s*(?:₹|rs\.?|inr)?\s*(\d[\d,]*)/i,
  ];
  for (const pat of patterns) {
    const m = text.match(pat);
    if (m) {
      const num = parseInt(m[1].replace(/,/g, ""), 10);
      if (num >= 50) return num; // backend requires budget_inr >= 50
    }
  }
  return undefined;
}

function ChatPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [text, setText] = useState(samplePrompts[0]);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    {
      role: "assistant",
      text: "Describe your occasion or paste a recipe, and I'll build a cart for you.",
    },
  ]);
  const [cartData, setCartData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, phase]);

  const onSubmit = async () => {
    if (!text.trim() || phase === "thinking") return;

    const inputText = text.trim();
    setMessages((m) => [...m, { role: "user", text: inputText }]);
    setPhase("thinking");
    setText("");
    setErrorMsg(null);

    // Extract budget from user input if present
    const budget = extractBudget(inputText);

    try {
      const body: any = {
        content: inputText,
        input_type: "text",
      };
      if (budget) body.budget_inr = budget;

      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        // Try to extract a useful error message from the backend
        let errDetail = `Server error (${res.status})`;
        try {
          const errData = await res.json();
          errDetail = errData.message || errData.detail || errDetail;
        } catch {
          // fallback to default errDetail if JSON parsing fails
        }
        throw new Error(errDetail);
      }

      const data = await res.json();

      // Backend returns a multi-intent shape:
      //   { intents: [{ intent_type, context_summary, cart[], unavailable_items[] }],
      //     confidence, clarification_question, total_price_inr, budget_exceeded, summary }
      // Flatten it into the single-cart view this pane renders.
      const intents: any[] = data.intents ?? [];
      const allCartItems = intents.flatMap((g: any) => g.cart ?? []);
      const allUnavailable = intents.flatMap((g: any) => g.unavailable_items ?? []);
      const intentType = intents
        .map((g: any) => g.intent_type)
        .filter(Boolean)
        .join(", ");
      const contextSummary = intents
        .map((g: any) => g.context_summary)
        .filter(Boolean)
        .join(" · ");

      // Low-confidence inputs come back with a clarification question and no cart.
      if (data.confidence === "low" && data.clarification_question) {
        setMessages((m) => [...m, { role: "assistant", text: data.clarification_question }]);
        setPhase("idle");
        return;
      }

      // Normalize to the flat shape the UI below consumes.
      setCartData({
        ...data,
        cart: allCartItems,
        unavailable_items: allUnavailable,
        intent_type: intentType || "shopping",
        context_summary: contextSummary,
      });

      // Build a rich summary message
      const itemCount = allCartItems.length;
      const unavailCount = allUnavailable.length;
      let summaryText =
        data.summary ||
        `I found ${itemCount} items for your ${intentType || "shopping"} list, totaling Rs.${data.total_price_inr}.`;
      if (unavailCount > 0) {
        summaryText += ` (${unavailCount} item${unavailCount > 1 ? "s" : ""} unavailable)`;
      }

      setMessages((m) => [...m, { role: "assistant", text: summaryText }]);
      setPhase("cart");
    } catch (e: any) {
      const msg = e.message || "Something went wrong. Please try again.";
      setErrorMsg(msg);
      setMessages((m) => [...m, { role: "assistant", text: `⚠️ ${msg}` }]);
      setPhase("idle");
    }
  };

  return (
    <AppShell>
      <div className="mx-auto grid h-[calc(100vh-4rem)] max-w-7xl grid-cols-1 lg:grid-cols-[1fr_440px]">
        {/* Left: conversation */}
        <div className="flex min-h-0 flex-col border-r border-border">
          <div className="border-b border-border px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-brand" />
              <span className="font-medium">Context-to-Cart</span>
              <span className="text-muted-foreground">· Describe it, paste it, drop it</span>
            </div>
          </div>

          <Conversation className="flex-1">
            <ConversationContent>
              {messages.map((m, i) => (
                <Message key={i} from={m.role}>
                  {m.role === "assistant" ? (
                    <MessageContent>
                      <MessageResponse>{m.text}</MessageResponse>
                    </MessageContent>
                  ) : (
                    <MessageContent>{m.text}</MessageContent>
                  )}
                </Message>
              ))}

              {phase === "thinking" && (
                <Message from="assistant">
                  <MessageContent>
                    <Shimmer>Extracting intent and building your cart…</Shimmer>
                  </MessageContent>
                </Message>
              )}

              {phase === "cart" && cartData && (
                <Message from="assistant">
                  <MessageContent>
                    <div className="space-y-3">
                      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Intent extracted
                      </div>
                      <pre className="overflow-x-auto rounded-lg bg-surface p-3 text-xs leading-relaxed text-foreground">
                        {JSON.stringify(
                          { intent: cartData.intent_type, summary: cartData.context_summary },
                          null,
                          2,
                        )}
                      </pre>
                    </div>
                  </MessageContent>
                </Message>
              )}
              <div ref={bottomRef} />
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          {/* Error banner */}
          {errorMsg && (
            <div className="flex items-center gap-2 border-t border-destructive/30 bg-destructive/10 px-4 py-2 text-xs text-destructive">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1">{errorMsg}</span>
              <button onClick={() => setErrorMsg(null)}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="border-t border-border bg-background p-3 sm:p-4">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {[
                { i: LinkIcon, l: "Paste URL" },
                { i: ImageIcon, l: "Image" },
                { i: FileText, l: "PDF" },
                { i: Paperclip, l: "WhatsApp" },
              ].map((c) => (
                <button
                  key={c.l}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-muted-foreground hover:border-foreground hover:text-foreground"
                >
                  <c.i className="h-3.5 w-3.5" />
                  {c.l}
                </button>
              ))}
            </div>
            <PromptInput onSubmit={onSubmit}>
              <PromptInputTextarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Describe what you're planning…"
              />
              <div className="flex items-center justify-end p-2">
                <PromptInputSubmit status={phase === "thinking" ? "submitted" : undefined} />
              </div>
            </PromptInput>
          </div>
        </div>

        {/* Right: cart pane */}
        <aside className="hidden min-h-0 flex-col bg-surface lg:flex">
          {cartData ? (
            <>
              <div className="border-b border-border px-5 py-3">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Live cart
                </div>
                <div className="mt-1 text-base font-semibold">{cartData.intent_type}</div>
                <div className="mt-1 text-xs text-muted-foreground">{cartData.context_summary}</div>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Wallet className="h-3.5 w-3.5" /> ₹{cartData.total_price_inr}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {cartData.cart?.length ?? 0} items
                  </span>
                  {cartData.budget_exceeded && (
                    <span className="inline-flex items-center gap-1 text-destructive">
                      <AlertTriangle className="h-3.5 w-3.5" /> Over budget
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {cartData.cart?.map((it: any, idx: number) => (
                    <div
                      key={it.sku || idx}
                      className="rounded-xl border border-border bg-background p-3"
                    >
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{it.name}</div>
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {it.brand} · {it.quantity_units} × {it.unit_quantity}
                            {it.unit}
                          </div>
                          <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[10px] text-muted-foreground">
                            <Check className="h-3 w-3 text-brand" />
                            {it.substituted
                              ? it.substitution_reason || "Substituted"
                              : it.matched_from?.length > 0
                                ? it.matched_from.join(", ")
                                : "Matched"}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-sm font-semibold">₹{it.total_price_inr}</div>
                          <div className="text-[10px] text-muted-foreground">
                            ₹{it.price_per_unit_inr}/unit
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Unavailable items */}
                {cartData.unavailable_items?.length > 0 && (
                  <div className="mt-4">
                    <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Unavailable
                    </div>
                    <div className="space-y-1.5">
                      {cartData.unavailable_items.map((it: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 rounded-lg border border-border/50 bg-destructive/5 px-3 py-2 text-xs"
                        >
                          <AlertTriangle className="h-3 w-3 shrink-0 text-destructive" />
                          <span className="font-medium">{it.name}</span>
                          <span className="text-muted-foreground">
                            — {it.reason?.replace(/_/g, " ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-border bg-background p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-lg font-semibold">₹{cartData.total_price_inr}</span>
                </div>
                <Link
                  to="/cart/$id"
                  params={{ id: cartData.session_id }}
                  className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-sm font-medium text-background hover:bg-foreground/90"
                >
                  Review cart
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-4 text-sm text-muted-foreground">
              Your cart will appear here
            </div>
          )}
        </aside>
      </div>
    </AppShell>
  );
}
