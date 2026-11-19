import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Phone } from "lucide-react";

const WA = "https://wa.me/263786439800";
const PHONE = "+263 786 439 800";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact | Falcon Remit" },
      { name: "description", content: "Contact Falcon Remit by WhatsApp or phone." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <main className="min-h-[70vh] bg-background">
      <section className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-red">Contact</p>
        <h1 className="mt-2 text-4xl font-extrabold text-navy">Talk to a real person.</h1>
        <p className="mt-3 text-muted-foreground">Mon–Sat · 08:00–18:00 (CAT)</p>
        <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
          <a href={WA} className="flex items-center gap-3 rounded-xl bg-secondary p-5 text-navy">
            <MessageCircle className="h-6 w-6" />
            <div>
              <p className="text-sm text-muted-foreground">WhatsApp us</p>
              <p className="font-bold">{PHONE}</p>
            </div>
          </a>
          <a
            href="tel:+263786439800"
            className="flex items-center gap-3 rounded-xl border border-border p-5 text-navy"
          >
            <Phone className="h-6 w-6" />
            <div>
              <p className="text-sm text-muted-foreground">Call us</p>
              <p className="font-bold">{PHONE}</p>
            </div>
          </a>
        </div>
      </section>
    </main>
  );
}
