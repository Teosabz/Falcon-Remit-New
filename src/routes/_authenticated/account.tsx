import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getAccount, saveProfile } from "@/lib/accounts.functions";
import { supabase } from "@/integrations/supabase/client";
import { isStaff } from "@/lib/quote-request";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
const options = queryOptions({ queryKey: ["account"], queryFn: () => getAccount() });
export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My account | Falcon Remit" },
      { name: "description", content: "Manage your verified Falcon Remit account." },
      { property: "og:title", content: "Falcon Remit account" },
      { property: "og:description", content: "Your profile and approved access." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(options),
  component: Account,
});
function Account() {
  const { data, refetch } = useSuspenseQuery(options);
  const { queryClient } = Route.useRouteContext();
  const navigate = useNavigate();
  const [name, setName] = useState(data.profile.display_name);
  const [notice, setNotice] = useState("");
  return (
    <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-navy">My account</h1>
      {data.roles.some((r) => r.role === "admin") && (
        <p className="mt-2 text-sm font-semibold text-brand-red">Administrator account</p>
      )}
      <form
        className="mt-6 max-w-sm space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await saveProfile({ data: { display_name: name } });
            await refetch();
            setNotice("Profile saved");
          } catch (e) {
            setNotice(e instanceof Error ? e.message : "Unable to save");
          }
        }}
      >
        <label className="block text-sm font-semibold">
          Display name
          <Input required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <Button>Save profile</Button>
        <p role="status" className="text-sm">
          {notice}
        </p>
      </form>
      <div className="mt-8 flex flex-wrap gap-3">
        {isStaff(data.roles) && (
          <Button asChild>
            <Link to="/staff/requests">Staff quote requests</Link>
          </Button>
        )}
        {data.roles.some((r) => r.role === "admin") && (
          <Button asChild variant="outline">
            <Link to="/admin">Admin accounts</Link>
          </Button>
        )}
        <Button
          variant="outline"
          onClick={async () => {
            await queryClient.cancelQueries();
            queryClient.clear();
            await supabase.auth.signOut();
            await navigate({ to: "/staff-login", replace: true });
          }}
        >
          Sign out
        </Button>
      </div>
    </main>
  );
}
