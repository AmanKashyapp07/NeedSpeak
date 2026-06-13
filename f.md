# NeedSpeak — Feature Status & Brainstorm
*Cross-referenced against the Final Report (Amazon HackOn 2026) and actual codebase.*

---

## Legend
- ✅ **Done** — Built and wired end-to-end
- 🟡 **Partial** — UI shell exists, backend logic missing or mocked
- ❌ **Not started** — Described in report, nothing in codebase yet
- 💡 **New idea** — Not in the report; brainstormed additions

---

## Pillar 1 — Intent Engine (Context-to-Cart)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1.1 | Natural language text input | ✅ | `/api/parse` POST, full pipeline |
| 1.2 | Recipe URL ingestion (AllRecipes, BBCGoodFood) | ✅ | `url_fetcher.py`, JSON-LD extraction |
| 1.3 | YouTube transcript ingestion | ✅ | `youtube_fetcher.py`, auto-gen captions |
| 1.4 | WhatsApp message input | 🟡 | UI chip exists, no actual parsing logic |
| 1.5 | Shopping list image / handwritten list | 🟡 | UI chip exists, no OCR/vision backend |
| 1.6 | PDF document ingestion | 🟡 | UI chip exists, no extraction |
| 1.7 | Structured JSON output (intent, items, qty, units) | ✅ | `ExtractionResult`, `ExtractedIntent` models |
| 1.8 | Hindi / Hinglish / Indian English understanding | ✅ | Prompt rules 8; tested via Gemini |
| 1.9 | Budget extraction from text (regex) | ✅ | `extractBudgetFromText()` in chat.tsx |
| 1.10 | Budget field (explicit UI input) | ✅ | `₹ Budget` input above prompt |
| 1.11 | Servings override | ✅ | `servings_override` param in API |

---

## Pillar 2 — OccasionCart

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 2.1 | Occasion tiles on homepage | ✅ | `occasions.tsx`, 6 cards |
| 2.2 | Occasion tiles on dedicated page | ✅ | `/occasions` route |
| 2.3 | Clicking occasion prefills chat | 🟡 | Navigates to `/chat` but does NOT prefill the textarea with the occasion |
| 2.4 | Backend occasion → item blueprint mapping | ❌ | No OccasionCart templates on backend; everything goes through the LLM |
| 2.5 | Adjustable occasion parameters (people, budget) | ❌ | Only available if the user types them into chat |

---

## Pillar 3 — RecipeCart

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 3.1 | Recipe URL → ingredient extraction | ✅ | AllRecipes, BBCGoodFood via JSON-LD |
| 3.2 | Ingredient → SKU matching | ✅ | `resolver.py` keyword matching |
| 3.3 | Quantity scaling to servings | ✅ | Prompt rule + `servings_override` |
| 3.4 | YouTube cooking video → cart | ✅ | Transcript fetched, then extraction pipeline |

---

## Pillar 4 — Quantity Engine

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 4.1 | Unit normalization (g, ml, tsp, cups, cloves…) | ✅ | `unit_conversions.py`, 70+ mappings |
| 4.2 | Product units → quantity calculation | ✅ | `_calculate_quantity_units()` in resolver |
| 4.3 | Attendee-aware quantity scaling | 🟡 | LLM handles it via prompt; no deterministic rule engine per the report's intent |
| 4.4 | Quantity increment/decrement in UI | ✅ | `QuantityControl` in chat.tsx Live Cart pane |
| 4.5 | Quantity deduplication | ✅ | `_deduplicate_extracted_items()` |

---

## Pillar 5 — Multi-Intent Decomposition

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 5.1 | Single input → multiple intent groups | ✅ | `intents[]` in `ExtractionResult`, multiple `IntentGroup` resolved |
| 5.2 | Separate carts per intent | ✅ | Each intent resolved independently in `main.py` |
| 5.3 | Frontend renders multi-intent (flattened) | ✅ | Flattened in chat.tsx; per-intent grouping not shown |
| 5.4 | Per-intent cart display in Live Cart pane | 🟡 | Items flattened into single list; intent labels merged |

---

## Pillar 6 — Collaborative Cart (SplitCart)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 6.1 | Collab page UI shell | ✅ | `/collab/$id` route with budget bar, contributors, items |
| 6.2 | QR code generation | 🟡 | Button exists, no actual QR code generated |
| 6.3 | Share link | 🟡 | Copy button exists, no link generation |
| 6.4 | Real-time contribution (multiple users adding items) | ❌ | Static mock data only — no WebSocket or polling |
| 6.5 | Budget auto-rebalancing on new items | ❌ | Not implemented |
| 6.6 | Invite contributor flow | 🟡 | "Invite" button exists, no backend |

---

## Pillar 7 — GoalCart (Budget Optimization)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 7.1 | Budget optimization (automatic substitution on budget exceed) | ✅ | `_optimize_for_budget()` in resolver |
| 7.2 | Substitution reason shown per item | ✅ | `substitution_reason` field displayed in UI |
| 7.3 | Explicit swap suggestions UI (show cheaper alternative without auto-swapping) | ❌ | Report requires user choice; code auto-swaps silently |
| 7.4 | Budget progress bar in Live Cart | ✅ | Thin progress bar in chat.tsx footer |
| 7.5 | Budget over/under indicator | ✅ | Live in cart pane header |

---

## Pillar 8 — CompareCart ("What If" Engine)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 8.1 | CompareCart modal in ReviewCart page | ✅ | Budget slider + over/under status shown |
| 8.2 | "What if budget lower?" diff | 🟡 | Slider changes the display total but does NOT re-run the resolver |
| 8.3 | "What if attendees increase?" diff | ❌ | Not implemented |
| 8.4 | "What if I went vegan?" diff | ❌ | Not implemented |
| 8.5 | Added / Removed / Swapped items diff view | ❌ | Only a number comparison, no actual item diff |

---

## Pillar 9 — Preference Constraints

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 9.1 | Preferences page UI | ✅ | `/preferences` route exists |
| 9.2 | Dietary preferences (Veg / Vegan / Jain) | 🟡 | UI fields exist; not sent to backend or respected in resolver |
| 9.3 | Preferred brands | 🟡 | UI fields exist; not wired to resolver |
| 9.4 | Budget style (Value / Balanced / Premium) | 🟡 | UI fields exist; not wired |
| 9.5 | Preferences persisted (localStorage / user account) | ❌ | No persistence |

---

## Pillar 10 — Smart Alternatives

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 10.1 | Alternative product suggested per item | 🟡 | Budget-triggered substitution only; no "show alternative, you decide" |
| 10.2 | User-facing accept/reject alternative | ❌ | Auto-swaps silently; user cannot choose |
| 10.3 | Savings amount shown per alternative | 🟡 | `substitution_reason` string contains savings but unstructured |

---

## Pillar 11 — Explainable Shopping

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 11.1 | "Why was this added?" per item | ✅ | `matched_from[]` shown as a chip on each item |
| 11.2 | "Why was this substituted?" per item | ✅ | `substitution_reason` shown |
| 11.3 | Unavailable items with reason | ✅ | `UnavailableReason` shown in both panes |

---

## Pillar 12 — Confidence Layer

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 12.1 | Confidence scoring (high / medium / low) | ✅ | LLM returns `confidence` field |
| 12.2 | Clarification question when confidence is low | ✅ | Surfaced as assistant message in chat |
| 12.3 | Wait for clarification before building cart | ✅ | `setPhase("idle")` on low confidence |
| 12.4 | Proceed with refined input after clarification | ✅ | User can re-type and resubmit |

---

## Pillar 13 — ReviewCart

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 13.1 | ReviewCart page | ✅ | `/cart/$id` full page |
| 13.2 | Budget widget with progress bar | ✅ | |
| 13.3 | Per-item explainability | ✅ | `matched_from`, substitution reason |
| 13.4 | AI-generated summary | ✅ | `session.summary` shown in sidebar |
| 13.5 | Proceed to checkout button | 🟡 | Button exists, no actual checkout integration |

---

## Infrastructure & Platform

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| I.1 | FastAPI backend | ✅ | |
| I.2 | Gemini 2.5 Flash LLM provider | ✅ | With retry + fallback models |
| I.3 | Amazon Bedrock (Claude Sonnet) provider | ✅ | Toggle via `LLM_PROVIDER=bedrock` |
| I.4 | DynamoDB session storage | ✅ | With in-memory mock fallback |
| I.5 | S3 raw input + result storage | ✅ | With mock fallback |
| I.6 | Mock catalog (~45 Indian SKUs) | ✅ | In `dynamo.py` mock data |
| I.7 | Full DynamoDB product catalog (80 SKUs) | ✅ | `seed_catalog.py` |
| I.8 | OpenSearch | ❌ | Mentioned in tech stack; not implemented |
| I.9 | AWS Amplify / CloudWatch hosting | ❌ | Mentioned; not configured |
| I.10 | Cart history in localStorage | ✅ | Last 20 sessions, with restore |
| I.11 | Dark/light theme toggle | ✅ | Persisted in localStorage |

---

## 💡 Brainstormed Features (Not in Report)

### UX & Interaction
| # | Feature | Priority | Why |
|---|---------|----------|-----|
| B.1 | **Occasion pre-fill** — clicking an occasion tile should inject a pre-written prompt into chat (e.g. "IPL watch party for 10 people, budget ₹1500") | 🔴 High | Currently navigates to chat with blank input; loses the entire OccasionCart value prop |
| B.2 | **Multi-intent split view** — instead of flattening all intents, show each intent as a collapsible section in the live cart (e.g. "Camping Supplies" vs "Weekly Groceries") | 🔴 High | The pipeline already returns separate intents; just the UI needs updating |
| B.3 | **Cart export** — download the cart as a WhatsApp-shareable text, CSV, or PDF | 🟡 Medium | Great for hackathon demos |
| B.4 | **Persona-aware prompts** — onboarding flow that asks "How many people in your household? Dietary preference?" and stores it as a user profile applied to every parse | 🟡 Medium | Preferences page exists but is not wired |
| B.5 | **Voice input** — tap mic, speak the context, transcribe client-side (Web Speech API), submit | 🟡 Medium | Report mentions in Phase 2 |
| B.6 | **Cart sharing link** — generate a `/cart/{id}` URL that anyone can open to view a read-only version of the cart | 🟡 Medium | Session endpoint already exists; just needs a shareable UI route |

### Cart Intelligence
| # | Feature | Priority | Why |
|---|---------|----------|-----|
| B.7 | **Re-run resolver on CompareCart** — when the user adjusts budget/people in CompareCart, POST to `/api/parse` again with new params and diff the two responses | 🔴 High | Current slider is purely cosmetic |
| B.8 | **Accept / Reject alternative** — for each substituted item, show the original alongside the substitute with a one-tap swap button | 🔴 High | The report requires this; code currently auto-swaps |
| B.9 | **Item removal** — let the user remove items from the live cart and see the total update | 🟡 Medium | Quantity goes to 1 minimum currently; needs delete |
| B.10 | **Re-order suggestion** — "You built a similar cart 2 weeks ago. Add those items again?" using localStorage history | 🟡 Medium | History already stored; just needs a UI prompt |
| B.11 | **Freshness / availability flag** — mock a "low stock" or "seasonal" badge on certain items | 🟢 Low | Visual polish for demo |

### Context Inputs
| # | Feature | Priority | Why |
|---|---------|----------|-----|
| B.12 | **Image OCR** — use Gemini Vision to extract items from a handwritten list photo | 🔴 High | Report mentions it; Gemini supports multimodal |
| B.13 | **PDF parsing** — extract text from a PDF (event checklist, school list) using pdf.js or pdfminer | 🟡 Medium | Report mentions it; UI chip exists |
| B.14 | **WhatsApp forward parsing** — accept pasted WhatsApp text "Please bring X, Y, Z" | 🟡 Medium | Easy; just text parsing, the UI chip already implies it |

### Collaboration
| # | Feature | Priority | Why |
|---|---------|----------|-----|
| B.15 | **Real-time collab via WebSocket** — host creates cart, shares link, others join and add items live | 🔴 High | Report's Pillar 6 is currently all mock data |
| B.16 | **Per-contributor budget split** — show how much each person owes | 🟡 Medium | Simple math on top of existing collab data |

### Data & Catalog
| # | Feature | Priority | Why |
|---|---------|----------|-----|
| B.17 | **Failed match log UI** — admin panel showing which items the resolver couldn't match (already logged to S3) | 🟡 Medium | Directly improves catalog coverage over time |
| B.18 | **Catalog size indicator** — "Matched X of Y items from 80 products" — makes the mock catalog limitation transparent | 🟢 Low | Good for hackathon transparency |

---

## Summary Scorecard

| Category | Done | Partial | Not Started |
|----------|------|---------|-------------|
| Intent Engine (Pillar 1) | 8 | 3 | 0 |
| OccasionCart (Pillar 2) | 2 | 1 | 2 |
| RecipeCart (Pillar 3) | 4 | 0 | 0 |
| Quantity Engine (Pillar 4) | 4 | 1 | 0 |
| Multi-Intent (Pillar 5) | 3 | 1 | 0 |
| SplitCart (Pillar 6) | 1 | 3 | 2 |
| GoalCart (Pillar 7) | 4 | 0 | 1 |
| CompareCart (Pillar 8) | 1 | 1 | 3 |
| Preferences (Pillar 9) | 1 | 3 | 1 |
| Smart Alternatives (Pillar 10) | 0 | 2 | 1 |
| Explainability (Pillar 11) | 3 | 0 | 0 |
| Confidence Layer (Pillar 12) | 4 | 0 | 0 |
| ReviewCart (Pillar 13) | 4 | 1 | 0 |
| Infrastructure | 8 | 0 | 3 |
| **Total** | **47** | **16** | **13** |

**Overall completion: ~62% of report features done, ~21% partial, ~17% not started.**

---

## Recommended Next Sprint (highest demo impact)

1. **B.1** Occasion pre-fill — 30 min, huge UX win
2. **B.7** Real CompareCart re-run — 2 hrs, turns a cosmetic feature into a real one
3. **B.8** Accept/reject alternative UI — 2 hrs, closes the GoalCart loop properly
4. **B.2** Per-intent sections in live cart — 1 hr, shows off multi-intent visually
5. **9.2–9.4** Wire preferences to resolver — 3 hrs, closes Pillar 9
6. **B.12** Gemini Vision image OCR — 3 hrs, closes the handwritten list demo

These six items would close the most visible demo gaps in under 12 hours of work.
