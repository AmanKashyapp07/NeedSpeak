import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Image as ImageIcon, Link as LinkIcon, MessageSquare, Sparkles, Type } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { featureBento, occasions, samplePrompts } from "@/lib/mock/needspeak";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NeedSpeak — Turn any context into a shopping cart" },
      { name: "description", content: "NeedSpeak converts text, recipes, images, WhatsApp messages, and PDFs into ready-to-review shopping carts with smart quantities, budget control, and alternatives." },
      { property: "og:title", content: "NeedSpeak — Context becomes cart" },
      { property: "og:description", content: "From 'IPL finals, 10 people, ₹1500' to a complete cart in seconds." },
    ],
  }),
  component: Landing,
});

const inputTypes = [
  { icon: Type, label: "Natural language" },
  { icon: LinkIcon, label: "Recipe URLs" },
  { icon: ImageIcon, label: "Shopping list image" },
  { icon: MessageSquare, label: "WhatsApp message" },
  { icon: FileText, label: "PDF / document" },
];

function Landing() {
  return (
    <AppShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-surface to-background" />
        <div className="mx-auto max-w-5xl px-4 pt-20 pb-16 sm:px-6 sm:pt-28 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            New · Context-to-Cart engine
          </div>
          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
            Turn any context <br className="hidden sm:block" />
            into a <span className="text-brand">shopping cart.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-lg text-muted-foreground">
            Tell NeedSpeak what you're planning — a watch party, a recipe, a trip — and get a ready-to-review cart with smart quantities, budget control, and alternatives.
          </p>

          {/* Prompt box */}
          <Link
            to="/chat"
            className="group mt-10 block rounded-2xl border border-border bg-card p-3 shadow-soft transition-shadow hover:shadow-pop"
          >
            <div className="flex items-start gap-3 rounded-xl bg-surface px-4 py-4">
              <Sparkles className="mt-1 h-5 w-5 shrink-0 text-brand" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">Try a prompt</p>
                <p className="mt-1 truncate text-base font-medium">
                  "IPL finals at my place. 10 people. Budget ₹1500."
                </p>
              </div>
              <div className="ml-auto inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-transform group-hover:translate-x-0.5">
                Build cart
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 px-2 pb-1">
              {inputTypes.map((t) => (
                <span key={t.label} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label}
                </span>
              ))}
            </div>
          </Link>

          {/* Sample prompts */}
          <div className="mt-6 flex flex-wrap gap-2">
            {samplePrompts.map((p) => (
              <Link
                key={p}
                to="/chat"
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground hover:border-foreground hover:text-foreground"
              >
                {p}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Occasions strip */}
      <section className="border-y border-border bg-surface/60">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Start from an occasion</h2>
              <p className="mt-1 text-sm text-muted-foreground">Predefined templates powered by the same engine.</p>
            </div>
            <Link to="/occasions" className="text-sm font-medium text-foreground hover:text-brand">See all →</Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {occasions.map((o) => (
              <Link
                key={o.id}
                to="/chat"
                className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground"
              >
                <div className="text-2xl">{o.emoji}</div>
                <div className="mt-3 text-sm font-medium">{o.name}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{o.items} items</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Feature bento */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-semibold tracking-tight">Everything in one engine</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">14 capabilities working together — extraction, quantity reasoning, budget control, alternatives, collaboration and review.</p>
        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {featureBento.map((f, i) => (
            <div
              key={f.title}
              className={`rounded-xl border border-border bg-card p-5 ${i === 0 ? "lg:col-span-2 lg:row-span-2 bg-foreground text-background" : ""}`}
            >
              <div className={`text-xs font-medium uppercase tracking-wider ${i === 0 ? "text-brand" : "text-muted-foreground"}`}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="mt-2 text-lg font-semibold">{f.title}</div>
              <p className={`mt-2 text-sm ${i === 0 ? "text-background/70" : "text-muted-foreground"}`}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-foreground p-10 text-background sm:p-14">
          <h3 className="text-3xl font-semibold tracking-tight">Stop building lists. Start describing.</h3>
          <p className="mt-3 max-w-xl text-background/70">Describe the moment — NeedSpeak figures out what to buy, how much, and where to save.</p>
          <Link
            to="/chat"
            className="mt-8 inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-medium text-brand-foreground hover:bg-brand/90"
          >
            Open the chat
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
