import { createFileRoute, redirect } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getAdminAccounts, grantStaff } from "@/lib/accounts.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
const options = queryOptions({ queryKey: ["admin-accounts"], queryFn: () => getAdminAccounts() });
export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw redirect({ to: "/admin-login", replace: true });
    const { data: admin, error } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (error || !admin) throw redirect({ to: "/account", replace: true });
  },
  head: () => ({
    meta: [
      { title: "Admin accounts | Falcon Remit" },
      { name: "description", content: "Administrator-only account management." },
      { property: "og:title", content: "Falcon Remit administration" },
      { property: "og:description", content: "Secure platform account management." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(options),
  errorComponent: () => (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-navy">Administrator access required</h1>
    </main>
  ),
  component: Admin,
});
function Admin() {
  const { data, refetch } = useSuspenseQuery(options);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-navy">Platform accounts</h1>
      <Input
        className="my-6 max-w-sm"
        aria-label="Search accounts"
        placeholder="Search name or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      <div className="divide-y divide-border">
        {data
          .filter((u) =>
            `${u.email} ${u.display_name}`.toLowerCase().includes(search.toLowerCase()),
          )
          .map((u) => (
            <article key={u.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
              <div>
                <h2 className="font-bold text-navy">{u.display_name || u.email}</h2>
                <p className="break-all text-sm text-muted-foreground">{u.email}</p>
                <p className="mt-1 text-xs">
                  {u.confirmed ? "Email verified" : "Awaiting email verification"} ·{" "}
                  {u.roles.join(", ") || "Customer"}
                </p>
              </div>
              <div className="flex gap-2">
                {(["staff", "admin"] as const)
                  .filter((role) => !u.roles.includes(role))
                  .map((role) => (
                    <Button
                      key={role}
                      variant="outline"
                      disabled={busy || !u.confirmed}
                      onClick={async () => {
                        if (!window.confirm(`Grant ${role} access to ${u.email}?`)) return;
                        setBusy(true);
                        setError("");
                        try {
                          await grantStaff({ data: { user_id: u.id, role } });
                          await refetch();
                        } catch (e) {
                          setError(e instanceof Error ? e.message : "Unable to grant access");
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      Grant {role}
                    </Button>
                  ))}
              </div>
            </article>
          ))}
      </div>
    </main>
  );
}
