
# NeedSpeak — Fresh UI Rebuild (Clean Light Commerce)

Scope: UI only. No backend, no real intent parsing — every feature is wired with realistic mock data so the screens demo end-to-end. You can plug in your existing logic from the GitHub repo afterwards.

## Visual System

- Palette: white `#FFFFFF` background, soft surface `#F5F5F5`, ink `#131A22`, action orange `#FF9900` (Amazon-style trust + energy).
- Type: Inter for body, a tighter display weight for headings. Generous whitespace, 12–14px radius, soft shadows.
- All tokens defined in `src/styles.css` via `@theme` + semantic CSS vars (no hardcoded colors in components).
- Dark mode kept but secondary; light is primary.

## Information Architecture (TanStack routes)

```
/                      Landing — hero "Context → Cart", quick-start prompts, feature grid
/chat                  Context-to-Cart workspace (main app)
/occasions             OccasionCart templates gallery
/recipe                RecipeCart — paste URL, see ingredient → cart flow
/cart/:id              ReviewCart — final cart with explanations, alternatives, compare
/collab/:id            SplitCart — shared cart with contributors + QR
/preferences           Preference Constraints settings
```

## Screens & Feature Mapping

1. **Landing (`/`)** — Hero with prompt input ("IPL finals, 10 people, ₹1500"), 4 input-type chips (Text · Recipe URL · Image · WhatsApp · PDF), trust strip, feature bento grid covering all 14 features.

2. **Chat / Context-to-Cart (`/chat`)** — Two-pane workspace:
   - Left: conversation thread (AI Elements: Conversation, Message, PromptInput, Shimmer). Supports text, URL paste, image upload, file upload tabs.
   - Right: live cart preview that fills in as intent is "extracted".
   - Inline **Intent Extraction** card showing structured JSON (occasion, attendees, budget).
   - **Confidence Layer**: ambiguous prompt triggers a clarifying chip-question card.
   - **Multi-Intent Decomposition**: when prompt has 2 goals, right pane shows tabbed carts.

3. **OccasionCart (`/occasions`)** — Grid of templates (IPL Watch Party, Birthday, Weekly Grocery, Hostel Restock, Travel, Festival). Click → seeds `/chat` with that template.

4. **RecipeCart (`/recipe`)** — URL input → animated 3-step pipeline (Extract → Quantity → Cart) → resulting cart.

5. **ReviewCart (`/cart/:id`)** — Full cart with:
   - **Explainable Shopping**: each line item has a "Why?" tooltip ("Added because 10 attendees detected").
   - **Smart Alternatives**: each item has an "Alternatives" drawer (Amul ₹50 → Vadilal ₹35, Save ₹15).
   - **Quantity Engine**: qty shown with reasoning chip ("2kg = 200g × 10").
   - **GoalCart** panel: budget bar + savings suggestions list.
   - **CompareCart** dialog: "What if?" sliders (budget, attendees, dietary) showing added/removed/replaced diff.
   - Final Review checklist (assumptions, qty, budget, alternatives) before Checkout CTA.

6. **SplitCart (`/collab/:id`)** — Shared cart, contributor avatars, per-person additions, shared budget bar, QR/share link button, rebalance indicator.

7. **Preferences (`/preferences`)** — Toggles for Veg/Vegan/Jain, Value/Balanced/Premium mode, preferred brands chips.

## Components to Build

- `src/components/layout/AppShell.tsx` — top nav (logo, links, preferences, cart badge).
- `src/components/landing/*` — Hero, PromptHero, FeatureBento, OccasionStrip, TrustStrip, Footer.
- `src/components/chat/*` — built on AI Elements (Conversation, Message, MessageResponse, PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputSubmit, Shimmer, Tool).
- `src/components/cart/*` — CartItem, CartItemExplain, AlternativesDrawer, BudgetBar, GoalSavingsList, CompareDialog, ReviewChecklist.
- `src/components/cart/IntentCard.tsx` — structured JSON pretty-display.
- `src/components/cart/ConfidenceCard.tsx` — clarifying chips.
- `src/components/collab/SplitCartHeader.tsx` — contributors + QR.
- `src/components/ui/*` — already present (shadcn).
- `src/lib/mock/needspeak.ts` — mock prompts, occasions, recipes, products, alternatives. Single source of demo data.

## Implementation Steps

1. Install AI Elements primitives: `bunx ai-elements@latest add conversation message prompt-input shimmer tool`.
2. Add `motion` (framer-motion) for hero + cart fill animations.
3. Define design tokens in `src/styles.css` (light-commerce palette, semantic mappings, brand orange accent, radii, shadows).
4. Replace `src/routes/index.tsx` placeholder with the new Landing page.
5. Create the 6 new route files listed above with proper `head()` SEO per route.
6. Build the layout shell + Landing first, then Chat workspace, then Cart screens, then Occasions/Recipe/Collab/Preferences.
7. Wire all interactions to mock data in `src/lib/mock/needspeak.ts` so every feature demos clickably.
8. Generate a NeedSpeak logo (premium quality, small) for the nav + empty states — no generic Sparkles icon.
9. Verify in preview at desktop + mobile; check tag balance + typecheck.

## Out of Scope (will not change)

- No real AI/LLM calls, no Lovable Cloud, no Supabase, no auth.
- No payment integration.
- AccessibilityCart, Subscription Drift, Smart Reordering (roadmap, not MVP).
- Your GitHub repo's existing backend/logic — you'll port it over after.

After approval I'll build this in one pass.
