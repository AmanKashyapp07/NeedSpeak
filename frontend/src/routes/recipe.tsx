import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check, ChefHat, ListChecks, ShoppingCart } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/recipe")({
  head: () => ({
    meta: [
      { title: "RecipeCart — NeedSpeak" },
      { name: "description", content: "Paste a recipe URL and get an ingredient cart with quantities scaled to your servings." },
      { property: "og:title", content: "RecipeCart" },
      { property: "og:description", content: "Recipe URL in. Cart out." },
    ],
  }),
  component: RecipePage,
});

const steps = [
  { icon: ChefHat, title: "Extract ingredients", desc: "Parsing recipe HTML" },
  { icon: ListChecks, title: "Compute quantities", desc: "Scaling for servings" },
  { icon: ShoppingCart, title: "Build cart", desc: "Matching products" },
];

const sampleIngredients = [
  { name: "Boneless chicken", qty: "500g", price: 220 },
  { name: "Basmati rice", qty: "2 cups", price: 90 },
  { name: "Onions", qty: "3 medium", price: 30 },
  { name: "Ginger-garlic paste", qty: "2 tbsp", price: 40 },
  { name: "Biryani masala", qty: "1 pack", price: 60 },
  { name: "Fresh mint & coriander", qty: "1 bunch each", price: 30 },
];

function RecipePage() {
  const [url, setUrl] = useState("https://www.example.com/chicken-biryani-recipe");
  const [active, setActive] = useState(2);

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-semibold tracking-tight">RecipeCart</h1>
        <p className="mt-2 text-muted-foreground">Paste any recipe URL — get a cart with the right quantities.</p>

        <div className="mt-8 rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-11 flex-1 rounded-lg border border-border bg-background px-4 text-sm outline-none focus:border-foreground"
              placeholder="https://…"
            />
            <button
              onClick={() => setActive((a) => (a + 1) % 3)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-foreground px-5 text-sm font-medium text-background hover:bg-foreground/90"
            >
              Extract ingredients
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Pipeline */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {steps.map((s, i) => {
              const done = i < active;
              const current = i === active;
              return (
                <div
                  key={s.title}
                  className={`flex items-start gap-3 rounded-xl border p-4 ${
                    current ? "border-foreground bg-surface" : done ? "border-border bg-background" : "border-dashed border-border bg-background"
                  }`}
                >
                  <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${done ? "bg-brand text-brand-foreground" : current ? "bg-foreground text-background" : "bg-surface text-muted-foreground"}`}>
                    {done ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{s.title}</div>
                    <div className="text-xs text-muted-foreground">{s.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resulting cart */}
        <div className="mt-8 rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <div className="text-sm text-muted-foreground">Recipe</div>
              <div className="text-lg font-semibold">Chicken Biryani · 4 servings</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Estimated</div>
              <div className="text-lg font-semibold">₹{sampleIngredients.reduce((s, i) => s + i.price, 0)}</div>
            </div>
          </div>
          <ul className="divide-y divide-border">
            {sampleIngredients.map((it) => (
              <li key={it.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{it.name}</div>
                  <div className="text-xs text-muted-foreground">{it.qty}</div>
                </div>
                <div className="text-sm font-semibold">₹{it.price}</div>
              </li>
            ))}
          </ul>
          <div className="border-t border-border p-4">
            <Link
              to="/cart/$id"
              params={{ id: "recipe-biryani" }}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-sm font-medium text-background hover:bg-foreground/90"
            >
              Review cart
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
