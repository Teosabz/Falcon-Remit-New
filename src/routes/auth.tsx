import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/falcon-logo.png";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Staff sign-in | Falcon Remit" },
      { name: "description", content: "Sign in to the Falcon Remit staff quote-request inbox." },
      { property: "og:title", content: "Falcon Remit staff sign-in" },
      { property: "og:description", content: "Secure sign-in for Falcon Remit staff." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StaffSignIn,
});
function StaffSignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [signup, setSignup] = useState(false);
  const [name, setName] = useState("");
  const [forgot, setForgot] = useState(false);
  const [sent, setSent] = useState(false);
  useEffect(() => {
    void supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "");
      if ((roles ?? []).some(({ role }) => role === "admin")) {
        await navigate({ to: "/admin", replace: true });
      } else if ((roles ?? []).some(({ role }) => role === "staff")) {
        await navigate({ to: "/staff/requests", replace: true });
      } else {
        await navigate({ to: "/account", replace: true });
      }
    });
  }, [navigate]);
  return (
    <main className="min-h-screen bg-secondary px-4 py-12">
      <div className="mx-auto max-w-sm">
        <Link
          to="/"
          className="mb-10 flex items-center justify-center gap-3 text-xl font-bold text-navy"
        >
          <img src={logo} alt="" className="h-12 w-12 object-contain" />
          Falcon Remit
        </Link>
        <h1 className="text-2xl font-extrabold text-navy">
          {forgot ? "Reset your password" : signup ? "Create your account" : "Sign in"}
        </h1>
        <form
          className="mt-6 space-y-5"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              if (forgot) {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                  redirectTo: `${window.location.origin}/reset-password`,
                });
                if (error) throw error;
                setSent(true);
              } else if (signup) {
                const { error } = await supabase.auth.signUp({
                  email,
                  password,
                  options: {
                    emailRedirectTo: window.location.origin + "/auth",
                    data: { full_name: name },
                  },
                });
                if (error) throw error;
                setSent(true);
              } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                await navigate({ to: "/account" });
              }
            } catch (e) {
              setError(e instanceof Error ? e.message : "Unable to sign in");
            } finally {
              setBusy(false);
            }
          }}
        >
          {signup && (
            <label className="block text-sm font-semibold">
              Full name
              <Input
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          )}
          <label className="block text-sm font-semibold">
            Email
            <Input
              type="email"
              required
              maxLength={255}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          {!forgot && (
            <label className="block text-sm font-semibold">
              Password
              <Input
                type="password"
                required
                minLength={8}
                autoComplete={signup ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          )}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {sent && (
            <p role="status" className="text-sm text-success">
              {signup
                ? "Check your email to verify your account before signing in."
                : "Check your email for a password reset link."}
            </p>
          )}
          <Button className="w-full bg-navy text-primary-foreground" disabled={busy}>
            {busy
              ? "Please wait…"
              : forgot
                ? "Send reset link"
                : signup
                  ? "Create account"
                  : "Sign in"}
          </Button>
        </form>
        <Button
          variant="link"
          className="mt-2 px-0"
          onClick={() => {
            setForgot(!forgot);
            setSent(false);
            setError("");
          }}
        >
          {forgot ? "Back to sign-in" : "Forgot password?"}
        </Button>
        <Button
          variant="link"
          className="mt-4 px-0"
          onClick={() => {
            setSignup(!signup);
            setForgot(false);
            setSent(false);
          }}
        >
          {signup ? "Already have an account? Sign in" : "Create an account"}
        </Button>
      </div>
    </main>
  );
}
