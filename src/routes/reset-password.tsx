import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — CodeDev" },
      { name: "description", content: "Choose a new password for your CodeDev placement prep account." },
      { property: "og:title", content: "Reset password — CodeDev" },
      { property: "og:description", content: "Securely set a new CodeDev password." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data: current }) => {
      if (current.session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated. You're signed in.");
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-[420px] bg-gradient-primary opacity-20 blur-[120px]" />
      <div className="relative w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-gradient-primary text-sm font-bold text-primary-foreground">
            {"</>"}
          </div>
          <span className="text-sm font-semibold tracking-tight">CodeDev</span>
        </Link>

        <div className="mica rounded-2xl p-7">
          <h1 className="text-xl font-semibold tracking-tight">Set a new password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Use at least 8 characters with a mix of letters, numbers and symbols.
          </p>

          {!ready ? (
            <div className="mt-6 rounded-xl border border-border bg-secondary p-4 text-sm text-muted-foreground">
              Open this page from the reset link in your email. If the link expired, request a new one from
              the sign-in page.
              <div className="mt-3">
                <Link to="/auth" className="text-primary hover:underline">
                  Back to sign in
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input
                  id="confirm"
                  type="password"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
                {busy ? "Updating…" : "Update password"}
              </Button>
            </form>
          )}
        </div>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
          CodeDev staff will never ask for your password or a reset link. Never share this page's link with
          anyone.
        </p>
      </div>
    </div>
  );
}
