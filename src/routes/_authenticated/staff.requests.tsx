import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { LogOut, RefreshCw, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getStaffInbox } from "@/lib/quotes.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
const inboxOptions = queryOptions({ queryKey: ["staff-inbox"], queryFn: () => getStaffInbox() });
export const Route = createFileRoute("/_authenticated/staff/requests")({
  beforeLoad: async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw redirect({ to: "/staff-login", replace: true });
    const { data: roles, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id);
    if (error || !(roles ?? []).some(({ role }) => role === "staff" || role === "admin")) {
      throw redirect({ to: "/account", replace: true });
    }
  },
  head: () => ({
    meta: [
      { title: "Quote requests | Falcon Remit staff" },
      { name: "description", content: "Private quote requests for approved Falcon Remit staff." },
      { property: "og:title", content: "Falcon Remit quote requests" },
      { property: "og:description", content: "Staff quote-request inbox." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(inboxOptions),
  component: StaffInbox,
});
function StaffInbox() {
  const { data, refetch, isRefetching } = useSuspenseQuery(inboxOptions);
  const { queryClient } = Route.useRouteContext();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const requests = data.requests.filter((r) =>
    `${r.customer_name} ${r.phone}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5">
          <Link to="/" className="font-heading text-xl font-bold text-navy">
            Falcon Remit
          </Link>
          <Button
            variant="outline"
            onClick={async () => {
              await queryClient.cancelQueries();
              queryClient.clear();
              await supabase.auth.signOut();
              await navigate({ to: "/auth", replace: true });
            }}
          >
            <LogOut />
            Sign out
          </Button>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-navy">Quote requests</h1>
            {data.profile?.display_name && (
              <p className="mt-2 text-muted-foreground">{data.profile.display_name}</p>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            title="Refresh requests"
            aria-label="Refresh requests"
            disabled={isRefetching}
            onClick={() => refetch()}
          >
            <RefreshCw />
          </Button>
        </div>
        {!data.approved ? (
          <p role="status" className="mt-8 text-muted-foreground">
            Your account is waiting for staff access approval.
          </p>
        ) : (
          <>
            <Input
              className="my-6 max-w-sm"
              placeholder="Search name or phone"
              aria-label="Search requests"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {requests.length === 0 ? (
              <p className="py-10 text-muted-foreground">
                {search ? "No matching requests." : "No quote requests yet."}
              </p>
            ) : (
              <div className="divide-y divide-border">
                {requests.map((r) => (
                  <article key={r.id} className="grid gap-4 py-6 md:grid-cols-[1fr_1fr_auto]">
                    <div>
                      <h2 className="text-lg font-bold text-navy">{r.customer_name}</h2>
                      <p className="text-sm text-muted-foreground">{r.phone}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleString("en-GB", {
                          timeZone: "Africa/Harare",
                        })}{" "}
                        CAT
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">
                        {r.service === "eft"
                          ? "Pay SA bank"
                          : r.service === "collect"
                            ? "USD collect"
                            : "EcoCash"}{" "}
                        · ${Number(r.usd_amount).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {r.payment_method === "cash" ? "USD cash" : "EcoCash"}
                      </p>
                      <details className="mt-2 text-sm">
                        <summary className="cursor-pointer text-navy">Quote details</summary>
                        <p className="mt-2 whitespace-pre-wrap break-words text-muted-foreground">
                          {r.message}
                        </p>
                      </details>
                    </div>
                    <Button asChild variant="outline">
                      <a
                        href={`https://wa.me/${r.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello ${r.customer_name}, Falcon Remit here regarding your quote request.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle />
                        WhatsApp
                      </a>
                    </Button>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
