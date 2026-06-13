import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeftRight, Check, ChevronDown, Info, Sparkles, TrendingDown, Wallet } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { iplCart } from "@/lib/mock/needspeak";

export const Route = createFileRoute("/cart/$id")({
  head: () => ({
    meta: [
      { title: "Review cart — NeedSpeak" },
      { name: "description", content: "Review every item with reasoning, alternatives, and budget control before checkout." },
      { property: "og:title", content: "ReviewCart — NeedSpeak" },
      { property: "og:description", content: "Explainable shopping with budget control." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const cart = iplCart;
  const [picks, setPicks] = useState<Record<string, "original" | "alt">>({});
  const [openAlt, setOpenAlt] = useState<string | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [whatIfBudget, setWhatIfBudget] = useState(1200);

  const total = useMemo(
    () =>
      cart.items.reduce((s, it) => {
        const pick = picks[it.id];
        if (pick === "alt" && it.alternative) return s + it.alternative.price;
        return s + it.price;
      }, 0),
    [cart, picks]
  );

  const potentialSavings = cart.items.reduce((s, it) => s + (it.alternative?.saves ?? 0), 0);
  const budgetPct = Math.min(100, (total / cart.budget) * 100);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">ReviewCart</div>
            <h1 className="mt-1 truncate text-3xl font-semibold tracking-tight">{cart.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{cart.attendees} attendees · budget ₹{cart.budget}</p>
          </div>
          <button
            onClick={() => setCompareOpen(true)}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm hover:border-foreground"
          >
            <ArrowLeftRight className="h-4 w-4" />
            <span className="hidden sm:inline">CompareCart</span>
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          {/* Items */}
          <div className="space-y-3">
            {cart.items.map((it) => {
              const isAlt = picks[it.id] === "alt" && it.alternative;
              const displayPrice = isAlt ? it.alternative!.price : it.price;
              const displayName = isAlt ? it.alternative!.name : it.name;
              const displayBrand = isAlt ? it.alternative!.brand : it.brand;
              const open = openAlt === it.id;

              return (
                <div key={it.id} className="rounded-2xl border border-border bg-card">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 p-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{displayBrand}</span>
                        {isAlt && (
                          <span className="rounded-full bg-success/15 px-1.5 py-0.5 text-[10px] font-medium text-success">Saved ₹{it.alternative!.saves}</span>
                        )}
                      </div>
                      <div className="mt-0.5 truncate text-base font-medium">{displayName}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{it.qty} · {it.category}</div>

                      {/* Why */}
                      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs text-muted-foreground">
                        <Info className="h-3.5 w-3.5 text-brand" />
                        Why? {it.reason}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-lg font-semibold">₹{displayPrice}</div>
                      {it.alternative && (
                        <button
                          onClick={() => setOpenAlt(open ? null : it.id)}
                          className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          Alternatives
                          <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
                        </button>
                      )}
                    </div>
                  </div>

                  {open && it.alternative && (
                    <div className="border-t border-border bg-surface/50 p-4">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-border bg-background p-3">
                        <div className="min-w-0">
                          <div className="text-xs text-muted-foreground">{it.alternative.brand}</div>
                          <div className="truncate text-sm font-medium">{it.alternative.name}</div>
                          <div className="mt-1 inline-flex items-center gap-1 text-xs text-success">
                            <TrendingDown className="h-3 w-3" />
                            Save ₹{it.alternative.saves}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <div className="text-sm font-semibold">₹{it.alternative.price}</div>
                          <button
                            onClick={() => {
                              setPicks((p) => ({ ...p, [it.id]: isAlt ? "original" : "alt" }));
                              setOpenAlt(null);
                            }}
                            className="inline-flex h-8 items-center gap-1 rounded-md bg-foreground px-3 text-xs font-medium text-background hover:bg-foreground/90"
                          >
                            {isAlt ? "Revert" : "Switch"}
                            {!isAlt && <Check className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sidebar: budget + goal + review */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-sm">
                <Wallet className="h-4 w-4 text-brand" />
                <span className="font-medium">Budget</span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-semibold">₹{total}</span>
                <span className="text-sm text-muted-foreground">/ ₹{cart.budget}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
                <div
                  className={`h-full ${total > cart.budget ? "bg-destructive" : "bg-brand"}`}
                  style={{ width: `${budgetPct}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {total > cart.budget ? `₹${total - cart.budget} over budget` : `₹${cart.budget - total} remaining`}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-brand" />
                <span className="font-medium">GoalCart suggestions</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">You're in control. Switch to save up to ₹{potentialSavings}.</p>
              <ul className="mt-3 space-y-2">
                {cart.items.filter((i) => i.alternative).map((it) => (
                  <li key={it.id} className="flex items-center justify-between gap-2 rounded-lg bg-surface px-3 py-2 text-xs">
                    <span className="min-w-0 truncate">{it.brand} → {it.alternative!.brand}</span>
                    <span className="shrink-0 font-medium text-success">−₹{it.alternative!.saves}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="text-sm font-medium">Final review</div>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                {["Assumptions look right", "Quantities match attendees", "Budget within range", "Reviewed alternatives"].map((q) => (
                  <li key={q} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-brand" />
                    {q}
                  </li>
                ))}
              </ul>
              <button className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-brand text-sm font-semibold text-brand-foreground hover:bg-brand/90">
                Proceed to checkout
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* CompareCart modal */}
      {compareOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4" onClick={() => setCompareOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-pop">
            <div className="text-lg font-semibold">CompareCart — What if?</div>
            <p className="mt-1 text-sm text-muted-foreground">Tweak inputs to see how your cart changes.</p>

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Budget</span>
                <span className="font-medium">₹{whatIfBudget}</span>
              </div>
              <input
                type="range"
                min={500}
                max={3000}
                step={100}
                value={whatIfBudget}
                onChange={(e) => setWhatIfBudget(Number(e.target.value))}
                className="mt-2 w-full accent-[var(--color-brand)]"
              />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg border border-border bg-background p-3">
                <div className="text-muted-foreground">Added</div>
                <div className="mt-1 text-lg font-semibold text-success">+0</div>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <div className="text-muted-foreground">Removed</div>
                <div className="mt-1 text-lg font-semibold text-destructive">−2</div>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <div className="text-muted-foreground">Replaced</div>
                <div className="mt-1 text-lg font-semibold text-foreground">3</div>
              </div>
            </div>

            <div className="mt-5 space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-surface px-3 py-2">
                <span className="text-muted-foreground">New estimated total</span>
                <span className="font-semibold">₹{Math.round(total * (whatIfBudget / cart.budget))}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setCompareOpen(false)} className="h-10 rounded-lg border border-border bg-background px-4 text-sm hover:bg-surface">Close</button>
              <button onClick={() => setCompareOpen(false)} className="h-10 rounded-lg bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90">Apply changes</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
