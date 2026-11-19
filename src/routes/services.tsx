import { createFileRoute, Link } from "@tanstack/react-router";
import { Landmark, Banknote, Smartphone } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services | Falcon Remit" },
      { name: "description", content: "Explore Falcon Remit transfer and EcoCash services." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const services = [
    [Landmark, "South African EFT", "Pay a South African bank from USD cash or EcoCash."],
    [
      Banknote,
      "USD collection",
      "Collect USD cash in Zimbabwe after a verified South African transfer.",
    ],
    [
      Smartphone,
      "EcoCash services",
      "Cash-in and cash-out with clear, separately displayed charges.",
    ],
  ] as const;
  return (
    <main className="min-h-[70vh] bg-background">
      <section className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-red">What we do</p>
        <h1 className="mt-2 max-w-2xl text-4xl font-extrabold text-navy-deep">
          One trusted counter for both sides of the border.
        </h1>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {services.map(([Icon, title, description]) => (
            <article key={title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-brand-red">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-navy">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
              <Link to="/rates" className="mt-5 inline-block font-semibold text-brand-red">
                View rates
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
