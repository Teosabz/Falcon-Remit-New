import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  Landmark,
  Banknote,
  Smartphone,
  MessageCircle,
  Lock,
  CircleCheck,
  Clock,
  HandCoins,
  Users,
  Phone,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuoteRequestDialog } from "@/components/quote-request-dialog";
import { supabase } from "@/integrations/supabase/client";
import { ecoCashFee, referenceRates } from "@/lib/pricing";
import logo from "@/assets/falcon-logo.png";
import promo from "@/assets/ecocash-promo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Falcon Remit — Money between Zimbabwe and South Africa" },
      {
        name: "description",
        content:
          "Pay any South African bank with USD, collect USD cash in Zimbabwe, and EcoCash cash-in and cash-out. Charges shown separately.",
      },
      { property: "og:title", content: "Falcon Remit — Fast. Safe. Reliable." },
      {
        property: "og:description",
        content: "Money between Zimbabwe and South Africa with honest, separate charges.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const WA = "https://wa.me/263786439800";
const PHONE = "+263 786 439 800";
const RATE_EFT = 0;
const RATE_COLLECT = 0;
const zar = (n: number) =>
  "R" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const usd = (n: number) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const eftCharge = (r: number) => (r <= 1000 ? 25 : r <= 5000 ? 35 : 50);
const wa = (t: string) => `${WA}?text=${encodeURIComponent(t)}`;

function Header() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
  }, []);
  const links = [
    ["Services", "/services"],
    ["Rates & charges", "/rates"],
    ["How it works", "/how"],
    ["Contact", "/contact"],
  ] as const;
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="#" className="flex items-center gap-2">
          <img src={logo} alt="Falcon Remit" className="h-10 w-10 object-contain" />
          <span className="font-heading text-lg font-bold">
            <span className="text-brand-red">Falcon</span> <span className="text-navy">Remit</span>
          </span>
        </a>
        <nav className="hidden gap-7 text-sm font-medium text-foreground md:flex">
          {links.map(([label, to]) => (
            <Link key={to} to={to} className="hover:text-brand-red">
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-5 md:flex">
          <Link
            to={signedIn ? "/account" : "/staff-login"}
            className="flex items-center gap-1.5 text-sm font-semibold text-navy"
          >
            <Lock className="h-3.5 w-3.5" />
            {signedIn ? "My account" : "Staff login"}
          </Link>
          {!signedIn && (
            <Link
              to="/admin-login"
              className="text-sm font-semibold text-brand-red hover:underline"
            >
              Admin login
            </Link>
          )}
          <a
            href={WA}
            className="rounded-full bg-brand-red px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-red)]"
          >
            WhatsApp us
          </a>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="border-2 border-navy bg-white text-navy shadow-md md:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>
      {open && (
        <div className="border-t border-border bg-background px-5 py-4 md:hidden">
          {links.map(([label, to]) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className="block py-2 font-medium"
            >
              {label}
            </Link>
          ))}
          <Link
            to={signedIn ? "/account" : "/staff-login"}
            onClick={() => setOpen(false)}
            className="flex items-center gap-1.5 py-2 font-semibold text-navy"
          >
            <Lock className="h-4 w-4" />
            {signedIn ? "My account" : "Staff login"}
          </Link>
          {!signedIn && (
            <Link
              to="/admin-login"
              onClick={() => setOpen(false)}
              className="block py-2 font-semibold text-brand-red"
            >
              Admin login
            </Link>
          )}
          <a
            href={WA}
            className="mt-2 block rounded-full bg-brand-red py-3 text-center font-semibold text-primary-foreground"
          >
            WhatsApp us
          </a>
        </div>
      )}
    </header>
  );
}

function Eyebrow({ c }: { c: string }) {
  return <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-red">{c}</p>;
}

function Index() {
  const [requestOpen, setRequestOpen] = useState(false);
  const [tab, setTab] = useState<"eft" | "collect" | "eco">("eft");
  const [amt, setAmt] = useState("100");
  const [pay, setPay] = useState<"cash" | "eco">("cash");
  const amount = parseFloat(amt) || 0;
  const tabs = [
    ["eft", "Pay SA bank", Landmark],
    ["collect", "USD collect", Banknote],
    ["eco", "EcoCash", Smartphone],
  ] as const;

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
    <main>
      <Header />
      <section className="overflow-hidden bg-secondary">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div>
            <div className="mb-5 flex items-center gap-3 text-sm font-bold text-navy">
              <span>🇿🇼 Zimbabwe</span>
              <ArrowRight className="h-4 w-4" />
              <span>South Africa 🇿🇦</span>
            </div>
            <h1 className="max-w-2xl text-4xl font-extrabold leading-tight text-navy-deep sm:text-5xl">
              Fast. Safe. Reliable. Money between Zimbabwe and South Africa.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Bring US dollars in Zimbabwe and we pay your recipient&apos;s South African bank in
              Rands. Send from South Africa and your family collects USD cash at our office. EcoCash
              cash-in and cash-out too.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/rates"
                className="inline-flex items-center gap-2 rounded-full bg-brand-red px-5 py-3 font-bold text-primary-foreground"
              >
                See today&apos;s rates <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={WA}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 font-bold text-navy"
              >
                <Phone className="h-4 w-4" /> {PHONE}
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-xl sm:p-7">
            <h2 className="text-2xl font-extrabold text-navy">Get a quote</h2>
            <div className="mt-5 grid grid-cols-3 rounded-xl bg-secondary p-1">
              {tabs.map(([value, label, Icon]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTab(value)}
                  className={`flex flex-col items-center gap-1 rounded-lg px-2 py-3 text-xs font-bold sm:text-sm ${tab === value ? "bg-card text-navy shadow-sm" : "text-muted-foreground"}`}
                >
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </div>
            {tab !== "eco" && (
              <>
                <label className="mt-5 block text-sm font-bold text-navy">You bring (USD)</label>
                <input
                  type="number"
                  min="1"
                  value={amt}
                  onChange={(event) => setAmt(event.target.value)}
                  className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-lg font-bold text-navy"
                />
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPay("cash")}
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold ${pay === "cash" ? "border-navy bg-navy text-white" : "border-border"}`}
                  >
                    Pay with USD cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPay("eco")}
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold ${pay === "eco" ? "border-navy bg-navy text-white" : "border-border"}`}
                  >
                    Pay with EcoCash
                  </button>
                </div>
                <div className="mt-5 rounded-xl bg-secondary p-4 text-sm">
                  <div className="flex justify-between">
                    <span>Exchange rate</span>
                    <strong>Awaiting confirmation</strong>
                  </div>
                  <div className="mt-3 flex justify-between">
                    <span>Service charge</span>
                    <strong>Confirmed by Falcon Remit</strong>
                  </div>
                  <div className="mt-3 flex justify-between border-t border-border pt-3">
                    <span className="font-bold">Total payable</span>
                    <strong>Quote required</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRequestOpen(true)}
                  className="mt-4 w-full rounded-full bg-brand-red py-3.5 font-bold text-primary-foreground"
                >
                  Request {tab === "eft" ? "this EFT" : "collection"} on WhatsApp
                </button>
              </>
            )}
            {tab === "eco" && (
              <div className="mt-5">
                <p className="text-muted-foreground">
                  EcoCash cash-in and cash-out charges are confirmed separately.
                </p>
                <a
                  href={WA}
                  className="mt-4 block rounded-full bg-brand-red py-3.5 text-center font-bold text-primary-foreground"
                >
                  Request EcoCash on WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      <a
        href={WA}
        aria-label="Chat with Falcon Remit on WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-success text-primary-foreground shadow-lg"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
      <QuoteRequestDialog
        open={requestOpen}
        onOpenChange={setRequestOpen}
        service={tab}
        amount={amount}
        payment={pay}
        message=""
        whatsapp={WA}
      />
    </main>
  );
}
