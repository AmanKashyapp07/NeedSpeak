const API_BASE = '/api';

/**
 * Timeout duration for API requests (in milliseconds).
 * Slightly longer than the 30s backend timeout so the server
 * can respond with its own timeout error first.
 */
const REQUEST_TIMEOUT_MS = 35_000;

/**
 * Main parse endpoint — sends text/URL context and receives a resolved cart.
 * Implements AbortController timeout and structured error handling.
 */
export async function parseContent({ input_type, content, servings_override, budget_inr }, mockMode = false) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const headers = { 'Content-Type': 'application/json' };
  if (mockMode) headers['X-Mock-Mode'] = '1';

  const body = { input_type, content };
  if (servings_override) body.servings_override = servings_override;
  if (budget_inr) body.budget_inr = budget_inr;

  try {
    const res = await fetch(`${API_BASE}/parse`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      // Try to parse structured error from backend
      const err = await res.json().catch(() => null);
      const message =
        err?.message ||
        err?.detail?.message ||
        err?.detail ||
        `Request failed (HTTP ${res.status})`;
      throw new Error(message);
    }

    return res.json();
  } catch (err) {
    // AbortController fires an AbortError on timeout
    if (err.name === 'AbortError') {
      throw new Error('The request timed out. The server may be busy — please try again in a moment.');
    }
    // Network errors (offline, DNS, CORS, etc.)
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      throw new Error('Could not reach the server. Please check your connection and try again.');
    }
    // Re-throw structured errors from above
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Retrieve a previously processed session by ID.
 */
export async function getSession(sessionId) {
  const res = await fetch(`${API_BASE}/session/${sessionId}`);
  if (!res.ok) throw new Error('Session not found');
  return res.json();
}

/**
 * Health check endpoint.
 */
export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}
