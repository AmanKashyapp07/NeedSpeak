import { createFileRoute } from "@tanstack/react-router";
import { Copy, QrCode, UserPlus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { iplCart } from "@/lib/mock/needspeak";

export const Route = createFileRoute("/collab/$id")({
  head: () => ({
    meta: [
      { title: "SplitCart — NeedSpeak" },
      { name: "description", content: "A shared cart for friends, roommates and parties. Everyone adds, budget auto-rebalances." },
      { property: "og:title", content: "SplitCart" },
      { property: "og:description", content: "Collaborative shopping with a shared budget." },
    ],
  }),
  component: CollabPage,
});

const contributors = [
  { name: "Tushar", color: "bg-brand", added: 3, spent: 540, you: true },
  { name: "Aman", color: "bg-chart-2", added: 1, spent: 200 },
  { name: "Priya", color: "bg-chart-4", added: 2, spent: 310 },
];

function CollabPage() {
  const cart = iplCart;
  const total = contributors.reduce((s, c) => s + c.spent, 0);
  const pct = Math.min(100, (total / cart.budget) * 100);

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">SplitCart</div>
            <h1 className="mt-1 truncate text-3xl font-semibold tracking-tight">{cart.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Shared with 3 contributors · budget ₹{cart.budget}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm hover:border-foreground">
              <Copy className="h-4 w-4" />
              <span className="hidden sm:inline">Copy link</span>
            </button>
            <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-foreground px-3 text-sm font-medium text-background hover:bg-foreground/90">
              <QrCode className="h-4 w-4" />
              QR
            </button>
          </div>
        </div>

        {/* Budget bar */}
        <div className="mt-8 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">Shared budget</span>
            <span><span className="text-lg font-semibold">₹{total}</span> <span className="text-muted-foreground">/ ₹{cart.budget}</span></span>
          </div>
          <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-surface">
            {contributors.map((c) => (
              <div key={c.name} className={c.color} style={{ width: `${(c.spent / cart.budget) * 100}%` }} />
            ))}
            <div className="bg-transparent" style={{ width: `${100 - pct}%` }} />
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            {contributors.map((c) => (
              <div key={c.name} className="inline-flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${c.color}`} />
                <span className="font-medium">{c.name}{c.you ? " (you)" : ""}</span>
                <span className="text-muted-foreground">₹{c.spent}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contributors */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {contributors.map((c) => (
            <div key={c.name} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${c.color} text-sm font-semibold text-background`}>
                  {c.name[0]}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{c.name}{c.you ? " · you" : ""}</div>
                  <div className="text-xs text-muted-foreground">{c.added} items · ₹{c.spent}</div>
                </div>
              </div>
            </div>
          ))}
          <button className="rounded-2xl border border-dashed border-border bg-background p-4 text-sm text-muted-foreground hover:border-foreground hover:text-foreground">
            <UserPlus className="mx-auto h-5 w-5" />
            <span className="mt-2 block">Invite contributor</span>
          </button>
        </div>

        {/* Items grouped */}
        <div className="mt-8 rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-3 text-sm font-medium">Everyone's items</div>
          <ul className="divide-y divide-border">
            {cart.items.map((it, i) => {
              const c = contributors[i % contributors.length];
              return (
                <li key={it.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`h-6 w-6 shrink-0 rounded-full ${c.color} grid place-items-center text-[10px] font-semibold text-background`}>
                      {c.name[0]}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{it.name}</div>
                      <div className="text-xs text-muted-foreground">{it.qty} · added by {c.name}</div>
                    </div>
                  </div>
                  <div className="shrink-0 text-sm font-semibold">₹{it.price}</div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
