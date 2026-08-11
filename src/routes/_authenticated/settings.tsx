import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Clock,
  Eye,
  KeyRound,
  Laptop,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  LogOut,
} from "lucide-react";
import { AppShell, PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SkeletonGrid, ErrorState } from "@/components/states";
import { supabase } from "@/integrations/supabase/client";
import {
  getSecurityOverview,
  updateSettings,
  clearLoginHistory,
  type UserSettings,
} from "@/lib/security.functions";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Security & privacy — CodeDev" },
      {
        name: "description",
        content:
          "Manage your CodeDev password, two-factor authentication, active sessions, login history and privacy controls.",
      },
      { property: "og:title", content: "Security & privacy — CodeDev" },
      { property: "og:description", content: "Control how your CodeDev account is protected and what others can see." },
    ],
  }),
  component: SettingsPage,
});

type Factor = { id: string; friendly_name?: string | undefined; status: string };

function SettingsPage() {
  const qc = useQueryClient();
  const fetchOverview = useServerFn(getSecurityOverview);
  const saveSettings = useServerFn(updateSettings);
  const clearHistory = useServerFn(clearLoginHistory);

  const overview = useQuery({ queryKey: ["security"], queryFn: () => fetchOverview() });

  const settings = overview.data?.settings;
  const roles = overview.data?.roles ?? [];

  const mutateSettings = useMutation({
    mutationFn: (patch: Partial<UserSettings>) => saveSettings({ data: patch }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["security"] });
      toast.success("Preferences saved");
    },
    onError: () => toast.error("Could not save that change"),
  });

  const wipeHistory = useMutation({
    mutationFn: () => clearHistory(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["security"] });
      toast.success("Login history cleared");
    },
  });

  return (
    <AppShell title="Security & privacy" subtitle="Protect your account and control what you share">
      <PageSection className="space-y-6">
        {overview.isLoading ? (
          <SkeletonGrid count={3} />
        ) : overview.isError ? (
          <ErrorState onRetry={() => overview.refetch()} />
        ) : (
          <>
            <div className="mica flex flex-wrap items-center gap-3 rounded-2xl p-5">
              <ShieldCheck className="size-5 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Account protection</p>
                <p className="text-xs text-muted-foreground">
                  Signed in as {roles.length ? roles.join(", ") : "student"} · auto sign-out{" "}
                  {settings?.auto_logout_minutes ? `${settings.auto_logout_minutes} min` : "off"}
                </p>
              </div>
              <SignOutEverywhere />
            </div>

            <Tabs defaultValue="security">
              <TabsList>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
              </TabsList>

              <TabsContent value="security" className="mt-5 space-y-5">
                <ChangePasswordCard />
                <TwoFactorCard />
                <AutoLogoutCard
                  value={settings?.auto_logout_minutes ?? 30}
                  onChange={(auto_logout_minutes) => mutateSettings.mutate({ auto_logout_minutes })}
                />
              </TabsContent>

              <TabsContent value="sessions" className="mt-5 space-y-5">
                <LoginHistoryCard
                  history={overview.data?.history ?? []}
                  onClear={() => wipeHistory.mutate()}
                  clearing={wipeHistory.isPending}
                />
              </TabsContent>

              <TabsContent value="privacy" className="mt-5 space-y-5">
                <PrivacyCard settings={settings} onChange={(patch) => mutateSettings.mutate(patch)} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </PageSection>
    </AppShell>
  );
}

function Card({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof KeyRound;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="mica rounded-2xl p-6">
      <div className="flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary">
          <Icon className="size-[18px] text-primary" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children && <div className="mt-5">{children}</div>}
    </section>
  );
}

function SignOutEverywhere() {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="mica"
      size="sm"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await supabase.auth.signOut({ scope: "global" });
        window.location.href = "/auth";
      }}
    >
      <LogOut className="mr-2 size-4" />
      Sign out everywhere
    </Button>
  );
}

function ChangePasswordCard() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords don't match.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPassword("");
    setConfirm("");
    toast.success("Password changed");
  };

  return (
    <Card icon={KeyRound} title="Change password" description="Use a unique password you don't reuse elsewhere.">
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm</Label>
          <Input
            id="confirm-password"
            type="password"
            minLength={8}
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" variant="hero" disabled={busy}>
            {busy ? "Updating…" : "Update password"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function TwoFactorCard() {
  const [factors, setFactors] = useState<Factor[]>([]);
  const [enrolling, setEnrolling] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors(((data?.totp ?? []) as Factor[]).filter((f) => f.status === "verified"));
  };

  useEffect(() => {
    void load();
  }, []);

  const start = async () => {
    setBusy(true);
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `Authenticator ${Date.now()}`,
    });
    setBusy(false);
    if (error || !data) {
      toast.error(error?.message ?? "Could not start setup");
      return;
    }
    setEnrolling({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  };

  const verify = async () => {
    if (!enrolling) return;
    setBusy(true);
    const challenge = await supabase.auth.mfa.challenge({ factorId: enrolling.id });
    if (challenge.error || !challenge.data) {
      setBusy(false);
      toast.error(challenge.error?.message ?? "Could not verify");
      return;
    }
    const { error } = await supabase.auth.mfa.verify({
      factorId: enrolling.id,
      challengeId: challenge.data.id,
      code,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setEnrolling(null);
    setCode("");
    toast.success("Two-factor authentication is on");
    void load();
  };

  const disable = async (factorId: string) => {
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Two-factor authentication removed");
    void load();
  };

  const active = factors.length > 0;

  return (
    <Card
      icon={active ? ShieldCheck : ShieldAlert}
      title="Two-factor authentication"
      description="Add a one-time code from an authenticator app on top of your password."
    >
      {active ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-foreground">
            Enabled
          </span>
          {factors.map((f) => (
            <Button key={f.id} variant="mica" size="sm" onClick={() => disable(f.id)}>
              Remove {f.friendly_name ?? "authenticator"}
            </Button>
          ))}
        </div>
      ) : enrolling ? (
        <div className="grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
          <img
            src={enrolling.qr}
            alt="QR code to add CodeDev to your authenticator app"
            className="size-40 rounded-xl border border-border bg-background p-2"
          />
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Scan with Google Authenticator, Authy or Microsoft Authenticator. Can't scan? Enter this key:
              <span className="mt-1 block break-all font-mono text-[11px] text-foreground">{enrolling.secret}</span>
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-2">
                <Label htmlFor="totp">6-digit code</Label>
                <Input
                  id="totp"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  placeholder="123456"
                  className="w-32 font-mono"
                />
              </div>
              <Button variant="hero" onClick={verify} disabled={busy || code.length !== 6}>
                Turn on 2FA
              </Button>
              <Button variant="mica" onClick={() => setEnrolling(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button variant="hero" onClick={start} disabled={busy}>
          {busy ? "Preparing…" : "Set up 2FA"}
        </Button>
      )}
    </Card>
  );
}

const AUTO_LOGOUT_OPTIONS = [0, 15, 30, 60, 120];

function AutoLogoutCard({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <Card
      icon={Clock}
      title="Auto sign-out"
      description="Sign out automatically after a period of inactivity — useful on shared college machines."
    >
      <div className="flex flex-wrap gap-2">
        {AUTO_LOGOUT_OPTIONS.map((minutes) => (
          <Button
            key={minutes}
            size="sm"
            variant={value === minutes ? "hero" : "mica"}
            onClick={() => onChange(minutes)}
          >
            {minutes === 0 ? "Never" : `${minutes} min`}
          </Button>
        ))}
      </div>
    </Card>
  );
}

function LoginHistoryCard({
  history,
  onClear,
  clearing,
}: {
  history: Array<{ id: string; device: string; browser: string; method: string; created_at: string }>;
  onClear: () => void;
  clearing: boolean;
}) {
  const rows = useMemo(() => history.slice(0, 25), [history]);
  return (
    <Card icon={Laptop} title="Login history" description="Recent sign-ins to your account across devices.">
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No sign-ins recorded yet.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Device</th>
                <th className="px-3 py-2 font-medium">Browser</th>
                <th className="px-3 py-2 font-medium">Method</th>
                <th className="px-3 py-2 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="px-3 py-2">{row.device}</td>
                  <td className="px-3 py-2 text-muted-foreground">{row.browser}</td>
                  <td className="px-3 py-2 text-muted-foreground capitalize">{row.method}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4">
        <Button variant="mica" size="sm" onClick={onClear} disabled={clearing || rows.length === 0}>
          <Trash2 className="mr-2 size-4" />
          Clear history
        </Button>
      </div>
    </Card>
  );
}

const VISIBILITY = [
  { value: "private", label: "Private" },
  { value: "recruiters", label: "Recruiters only" },
  { value: "public", label: "Public" },
];

function PrivacyCard({
  settings,
  onChange,
}: {
  settings: UserSettings | null | undefined;
  onChange: (patch: Partial<UserSettings>) => void;
}) {
  if (!settings) return null;
  const toggles: Array<{ key: keyof UserSettings; label: string; hint: string }> = [
    { key: "show_on_leaderboard", label: "Show me on leaderboards", hint: "Your display name and XP appear in rankings." },
    { key: "email_notifications", label: "Email notifications", hint: "Streak reminders and product updates." },
    { key: "interview_reminders", label: "Mock interview reminders", hint: "Nudges to keep your interview practice going." },
    { key: "share_analytics", label: "Share anonymous usage analytics", hint: "Helps improve recommendations. No personal data." },
  ];

  return (
    <>
      <Card icon={Eye} title="Profile visibility" description="Decide who can see your placement profile and stats.">
        <div className="flex flex-wrap gap-2">
          {VISIBILITY.map((option) => (
            <Button
              key={option.value}
              size="sm"
              variant={settings.profile_visibility === option.value ? "hero" : "mica"}
              onClick={() => onChange({ profile_visibility: option.value })}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </Card>

      <Card icon={ShieldCheck} title="Data & notifications" description="Fine-tune what CodeDev sends and shares.">
        <div className="space-y-4">
          {toggles.map((item) => (
            <div key={item.key} className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.hint}</p>
              </div>
              <Switch
                checked={Boolean(settings[item.key])}
                onCheckedChange={(checked) => onChange({ [item.key]: checked } as Partial<UserSettings>)}
              />
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
