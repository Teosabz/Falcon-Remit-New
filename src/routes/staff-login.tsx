import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/falcon-logo.png";

export const Route = createFileRoute("/staff-login")({
  head: () => ({
    meta: [
      { title: "Staff login | Falcon Remit" },
      { name: "description", content: "Sign in to the Falcon Remit staff quote-request inbox." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StaffLogin,
});

function StaffLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [signup, setSignup] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);
      const allowed = (roles ?? []).some(({ role }) => role === "staff" || role === "admin");
      if (allowed) void navigate({ to: "/staff/requests", replace: true });
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
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-red">
          Staff portal
        </p>
        <h1 className="text-2xl font-extrabold text-navy">
          {forgot ? "Reset your password" : signup ? "Create staff account" : "Staff sign in"}
        </h1>
        <form
          className="mt-6 space-y-5"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError("");
            setSent(false);
            try {
              if (forgot) {
                const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                  redirectTo: `${window.location.origin}/reset-password`,
                });
                if (resetError) throw resetError;
                setSent(true);
              } else if (signup) {
                const { error: signupError } = await supabase.auth.signUp({
                  email,
                  password,
                  options: {
                    emailRedirectTo: `${window.location.origin}/staff-login`,
                    data: { full_name: name },
                  },
                });
                if (signupError) throw signupError;
                setSent(true);
              } else {
                const { data, error: signInError } = await supabase.auth.signInWithPassword({
                  email,
                  password,
                });
                if (signInError) throw signInError;
                const { data: roles, error: rolesError } = await supabase
                  .from("user_roles")
                  .select("role")
                  .eq("user_id", data.user.id);
                if (rolesError) throw rolesError;
                const allowed = (roles ?? []).some(
                  ({ role }) => role === "staff" || role === "admin",
                );
                if (!allowed) {
                  await supabase.auth.signOut();
                  throw new Error("This account does not have staff access.");
                }
                await navigate({ to: "/staff/requests", replace: true });
              }
            } catch (caught) {
              setError(caught instanceof Error ? caught.message : "Unable to sign in");
            } finally {
              setBusy(false);
            }
          }}
        >
          {signup && !forgot && (
            <label className="block text-sm font-semibold">
              Full name
              <Input
                required
                maxLength={100}
                value={name}
                onChange={(event) => setName(event.target.value)}
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
              onChange={(event) => setEmail(event.target.value)}
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
                onChange={(event) => setPassword(event.target.value)}
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
                ? "Check your email to verify your account. Staff access must also be approved."
                : "Check your email for a password reset link."}
            </p>
          )}
          <Button className="w-full bg-navy text-primary-foreground" disabled={busy}>
            {busy
              ? "Please wait…"
              : forgot
                ? "Send reset link"
                : signup
                  ? "Create staff account"
                  : "Sign in to staff portal"}
          </Button>
        </form>
        <div className="mt-3 flex flex-wrap gap-4">
          <Button
            variant="link"
            className="px-0"
            onClick={() => {
              setForgot((value) => !value);
              setSignup(false);
              setSent(false);
              setError("");
            }}
          >
            {forgot ? "Back to staff sign-in" : "Forgot password?"}
          </Button>
          <Button
            variant="link"
            className="px-0"
            onClick={() => {
              setSignup((value) => !value);
              setForgot(false);
              setSent(false);
              setError("");
            }}
          >
            {signup ? "Already have an account? Sign in" : "Create account"}
          </Button>
        </div>
      </div>
    </main>
  );
}
