import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { quoteRequestSchema } from "@/lib/quote-request";
import { submitQuote } from "@/lib/quotes.functions";

export function QuoteRequestDialog({
  open,
  onOpenChange,
  service,
  amount,
  payment,
  message,
  whatsapp,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: "eft" | "collect" | "eco";
  amount: number;
  payment: "cash" | "eco";
  message: string;
  whatsapp: string;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{saved ? "Quote request sent" : "Request your quote"}</DialogTitle>
          <DialogDescription>
            {saved ? "Your request is in the Falcon Remit staff inbox." : "Your details"}
          </DialogDescription>
        </DialogHeader>
        {saved ? (
          <Button asChild className="bg-brand-red text-primary-foreground">
            <a href={whatsapp} target="_blank" rel="noopener noreferrer">
              Continue on WhatsApp
            </a>
          </Button>
        ) : (
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              const result = quoteRequestSchema.safeParse({
                customer_name: name,
                phone,
                service,
                usd_amount: amount,
                payment_method: payment,
                message,
              });
              if (!result.success) {
                setError(result.error.issues[0]?.message ?? "Check your details");
                return;
              }
              setBusy(true);
              try {
                await submitQuote({ data: result.data });
                setSaved(true);
              } catch (e) {
                setError(e instanceof Error ? e.message : "Please try again");
              } finally {
                setBusy(false);
              }
            }}
          >
            <label className="block text-sm font-semibold">
              Full name
              <Input
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </label>
            <label className="block text-sm font-semibold">
              Phone number
              <Input
                required
                maxLength={30}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </label>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button disabled={busy} className="w-full bg-brand-red text-primary-foreground">
              {busy ? "Sending…" : "Send quote request"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
