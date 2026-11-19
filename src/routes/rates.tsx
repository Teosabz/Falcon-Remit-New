import { createFileRoute, Link } from "@tanstack/react-router";
import { referenceRates } from "@/lib/pricing";

export const Route = createFileRoute("/rates")({
  head: () => ({
    meta: [
      { title: "Rates & charges | Falcon Remit" },
      { name: "description", content: "View Falcon Remit reference rates and charges." },
    ],
  }),
  component: RatesPage,
});

function RatesPage() {
  const rates = [
    ["USD → ZAR (EFT)", "Request a confirmed quote"],
    ["ZAR → USD (Collection)", "Request a confirmed quote"],
    ["Instant EFT charge", "Added separately in Rands"],
  ];
  return (
    <main className="min-h-[70vh] bg-background">
      <section className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-red">
          Today’s rates
        </p>
        <h1 className="mt-2 text-4xl font-extrabold text-navy-deep">Rates & charges</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {rates.map(([title, detail]) => (
            <article key={title} className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-bold text-navy">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
            </article>
          ))}
        </div>
        <div className="mt-10 rounded-2xl bg-secondary p-6">
          <h2 className="text-xl font-bold text-navy">Zimbabwe USD reference rates</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Official: ZiG {referenceRates.official} · Business maximum: ZiG{" "}
            {referenceRates.businessMax} · Cash reference: ZiG {referenceRates.cash}
          </p>
        </div>
        <Link
          to="/contact"
          className="mt-8 inline-flex rounded-full bg-brand-red px-5 py-3 font-bold text-primary-foreground"
        >
          Request a confirmed quote
        </Link>
      </section>
    </main>
  );
}
