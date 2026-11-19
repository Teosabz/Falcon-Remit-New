import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password | Falcon Remit" },
      { name: "description", content: "Set a new password for your Falcon Remit staff account." },
      { property: "og:title", content: "Falcon Remit password reset" },
      { property: "og:description", content: "Recover your staff account securely." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});
function ResetPassword() {
  const [valid, setValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setValid(new URLSearchParams(window.location.hash.slice(1)).get("type") === "recovery");
  }, []);
  return (
    <main className="min-h-screen bg-secondary px-4 py-16">
      <div className="mx-auto max-w-sm">
        <h1 className="text-2xl font-bold text-navy">Set a new password</h1>
        {!valid ? (
          <p className="mt-6">Open the password reset link from your email.</p>
        ) : saved ? (
          <p className="mt-6 text-success">Password updated.</p>
        ) : (
          <form
            className="mt-6 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              if (password !== confirm) {
                setError("Passwords do not match");
                return;
              }
              setBusy(true);
              const { error } = await supabase.auth.updateUser({ password });
              setBusy(false);
              if (error) setError(error.message);
              else setSaved(true);
            }}
          >
            <label className="block text-sm font-semibold">
              New password
              <Input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <label className="block text-sm font-semibold">
              Confirm password
              <Input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </label>
            {error && (
              <p role="alert" className="text-destructive">
                {error}
              </p>
            )}
            <Button disabled={busy} className="w-full">
              {busy ? "Saving…" : "Update password"}
            </Button>
          </form>
        )}
        <Link to="/auth" className="mt-6 block text-primary">
          Staff sign-in
        </Link>
      </div>
    </main>
  );
}
