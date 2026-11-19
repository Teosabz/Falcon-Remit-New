import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/how")({
  head: () => ({
    meta: [
      { title: "How it works | Falcon Remit" },
      { name: "description", content: "Learn how Falcon Remit transfers work." },
    ],
  }),
  component: HowPage,
});

function HowPage() {
  const steps = [
    ["1", "Request", "Send your transfer details."],
    ["2", "Confirm", "We confirm the rate and separate charges."],
    ["3", "Pay", "Pay USD cash or EcoCash."],
    ["4", "Complete", "We transfer and confirm payment."],
  ];
  return (
    <main className="min-h-[70vh] bg-navy py-16 text-primary-foreground">
      <section className="mx-auto max-w-6xl px-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-red">How it works</p>
        <h1 className="mt-2 text-4xl font-extrabold">A clear, verified process.</h1>
        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {steps.map(([number, title, text]) => (
            <article key={number} className="rounded-2xl border border-primary-foreground/15 p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-red font-bold">
                {number}
              </div>
              <h2 className="mt-4 font-bold">{title}</h2>
              <p className="mt-2 text-sm opacity-70">{text}</p>
            </article>
          ))}
        </div>
        <Link
          to="/contact"
          className="mt-10 inline-flex rounded-full bg-brand-red px-5 py-3 font-bold text-primary-foreground"
        >
          Talk to us
        </Link>
      </section>
    </main>
  );
}
