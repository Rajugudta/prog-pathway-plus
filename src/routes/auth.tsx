import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — CodeDev" },
      { name: "description", content: "Sign in to CodeDev to track lectures, problems, AI tutor threads and mock interviews." },
      { property: "og:title", content: "Sign in — CodeDev" },
      { property: "og:description", content: "Access your CodeDev learning studio." },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) navigate({ to: "/dashboard" });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  const signInWithGoogle = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Google sign-in failed. Please try again.");
        return;
      }
      if (result.redirected) return;
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  /** After a password sign-in, ask for a TOTP code when the account requires aal2. */
  const checkMfa = async () => {
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (data && data.nextLevel === "aal2" && data.nextLevel !== data.currentLevel) {
      const { data: list } = await supabase.auth.mfa.listFactors();
      const factor = list?.totp?.find((f) => f.status === "verified");
      if (factor) {
        setMfaFactorId(factor.id);
        return true;
      }
    }
    return false;
  };

  const submitMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaFactorId) return;
    setBusy(true);
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId: mfaFactorId });
      if (challenge.error || !challenge.data) throw challenge.error ?? new Error("Challenge failed");
      const { error } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challenge.data.id,
        code: mfaCode,
      });
      if (error) throw error;
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setResetSent(true);
        toast.success("Reset link sent — check your inbox.");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setCheckEmail(true);
          toast.success("Check your inbox to confirm your email.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await checkMfa();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
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
          <h1 className="text-xl font-semibold tracking-tight">
            {mfaFactorId
              ? "Two-factor verification"
              : mode === "signin"
                ? "Welcome back"
                : mode === "signup"
                  ? "Create your studio"
                  : "Reset your password"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mfaFactorId
              ? "Enter the 6-digit code from your authenticator app."
              : mode === "signin"
                ? "Pick up right where you left off."
                : mode === "signup"
                  ? "Progress, tutor threads and interview scores get saved to your account."
                  : "We'll email you a secure link to choose a new password."}
          </p>

          {mfaFactorId ? (
            <form onSubmit={submitMfa} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mfa">Authentication code</Label>
                <Input
                  id="mfa"
                  value={mfaCode}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  className="font-mono tracking-[0.4em]"
                />
              </div>
              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={busy || mfaCode.length !== 6}
              >
                {busy ? "Verifying…" : "Verify and continue"}
              </Button>
            </form>
          ) : (
            <>
              {mode !== "forgot" && (
                <div className="mt-6 space-y-3">
                  <Button
                    type="button"
                    variant="mica"
                    size="lg"
                    className="w-full"
                    disabled={busy}
                    onClick={signInWithGoogle}
                  >
                    <svg viewBox="0 0 24 24" className="mr-2 size-4" aria-hidden="true">
                      <path fill="#EA4335" d="M12 10.2v3.9h5.5a4.7 4.7 0 0 1-2 3.1l3.2 2.5c1.9-1.7 3-4.3 3-7.3 0-.7-.1-1.4-.2-2H12z" />
                      <path fill="#34A853" d="M6.6 14.3 5.9 15l-2.6 2c1.6 3.2 4.9 5.4 8.7 5.4 2.6 0 4.9-.9 6.5-2.4l-3.2-2.5c-.9.6-2 1-3.3 1-2.6 0-4.7-1.7-5.4-4z" />
                      <path fill="#4A90E2" d="M3.3 6.9A9.9 9.9 0 0 0 2.2 12c0 1.8.4 3.6 1.1 5.1l3.3-2.6a6 6 0 0 1 0-3.8z" />
                      <path fill="#FBBC05" d="M12 5.6c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 2.7 14.6 1.8 12 1.8c-3.8 0-7.1 2.2-8.7 5.4l3.3 2.6c.7-2.3 2.8-4.2 5.4-4.2z" />
                    </svg>
                    Continue with Google
                  </Button>
                  <div className="flex items-center gap-3">
                    <span className="h-px flex-1 bg-border" />
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">or</span>
                    <span className="h-px flex-1 bg-border" />
                  </div>
                </div>
              )}

              {checkEmail || resetSent ? (
                <div className="mt-6 rounded-xl border border-border bg-secondary p-4 text-sm text-muted-foreground">
                  {resetSent ? (
                    <>
                      We sent a password reset link to <span className="text-foreground">{email}</span>. The
                      link opens the reset page on this site — never enter it anywhere else.
                    </>
                  ) : (
                    <>
                      We sent a confirmation link to <span className="text-foreground">{email}</span>. Click
                      it, then come back and sign in.
                    </>
                  )}
                </div>
              ) : (
                <form onSubmit={submit} className="mt-6 space-y-4">
                  {mode === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="name">Display name</Label>
                      <Input
                        id="name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Ada Lovelace"
                        autoComplete="name"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@college.edu"
                      autoComplete="email"
                    />
                  </div>
                  {mode !== "forgot" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        {mode === "signin" && (
                          <button
                            type="button"
                            className="text-xs text-primary hover:underline"
                            onClick={() => setMode("forgot")}
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <Input
                        id="password"
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      />
                    </div>
                  )}
                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
                    {busy
                      ? "Working…"
                      : mode === "signin"
                        ? "Sign in"
                        : mode === "signup"
                          ? "Create account"
                          : "Send reset link"}
                  </Button>
                </form>
              )}

              <p className="mt-6 text-center text-xs text-muted-foreground">
                {mode === "forgot" ? (
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => {
                      setMode("signin");
                      setResetSent(false);
                    }}
                  >
                    Back to sign in
                  </button>
                ) : (
                  <>
                    {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => {
                        setMode(mode === "signin" ? "signup" : "signin");
                        setCheckEmail(false);
                      }}
                    >
                      {mode === "signin" ? "Create an account" : "Sign in"}
                    </button>
                  </>
                )}
              </p>
            </>
          )}
        </div>


        <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
          CodeDev will never ask for payment, OTPs or your password over chat, email or social media.
          Sign in only on this page, and never share your account with anyone offering placements or
          referrals.
        </p>
      </div>
    </div>
  );
}
