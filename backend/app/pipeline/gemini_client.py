from google import genai
from app import config

_gemini_client = None
_gemini_api_key_used = None

def get_gemini_client() -> genai.Client:
    global _gemini_client, _gemini_api_key_used
    # Re-create client if API key changed (e.g. after .env reload)
    if _gemini_client is None or _gemini_api_key_used != config.GEMINI_API_KEY:
        _gemini_client = genai.Client(api_key=config.GEMINI_API_KEY)
        _gemini_api_key_used = config.GEMINI_API_KEY
    return _gemini_client
