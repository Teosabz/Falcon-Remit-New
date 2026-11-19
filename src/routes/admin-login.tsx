import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/falcon-logo.png";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "Admin login | Falcon Remit" },
      { name: "description", content: "Secure administrator sign-in for Falcon Remit." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: admin } = await supabase.rpc("has_role", {
        _user_id: data.user.id,
        _role: "admin",
      });
      if (admin) void navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  return (
    <main className="min-h-screen bg-navy px-4 py-12 text-white">
      <div className="mx-auto max-w-sm rounded-2xl bg-white p-6 text-navy shadow-2xl">
        <Link to="/" className="mb-8 flex items-center justify-center gap-3 text-xl font-bold">
          <img src={logo} alt="" className="h-12 w-12 object-contain" />
          Falcon Remit
        </Link>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-red">
          Restricted area
        </p>
        <h1 className="text-2xl font-extrabold">Administrator sign in</h1>
        <form
          className="mt-6 space-y-5"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError("");
            try {
              const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
              });
              if (signInError) throw signInError;
              const { data: admin, error: roleError } = await supabase.rpc("has_role", {
                _user_id: data.user.id,
                _role: "admin",
              });
              if (roleError) throw roleError;
              if (!admin) {
                await supabase.auth.signOut();
                throw new Error("This account does not have administrator access.");
              }
              await navigate({ to: "/admin", replace: true });
            } catch (caught) {
              setError(caught instanceof Error ? caught.message : "Unable to sign in");
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="block text-sm font-semibold">
            Admin email
            <Input
              type="email"
              required
              maxLength={255}
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="block text-sm font-semibold">
            Password
            <Input
              type="password"
              required
              minLength={8}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button className="w-full bg-brand-red text-primary-foreground" disabled={busy}>
            {busy ? "Verifying…" : "Sign in as administrator"}
          </Button>
        </form>
        <Link
          to="/staff-login"
          className="mt-5 block text-center text-sm font-semibold text-navy underline"
        >
          Staff login
        </Link>
      </div>
    </main>
  );
}
