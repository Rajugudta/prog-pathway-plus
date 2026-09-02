import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Github, Globe, GraduationCap, Linkedin, MapPin, Plus, Target, X } from "lucide-react";
import { AppShell, PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkeletonCard } from "@/components/states";
import { useAuth } from "@/hooks/useAuth";
import { getFullProfile, updateProfile, type FullProfile } from "@/lib/placement.functions";
import { getProgress } from "@/lib/app.functions";
import { getAchievements } from "@/lib/achievements.functions";
import { PROBLEMS } from "@/data/problems";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — CodeDev" },
      {
        name: "description",
        content: "Your placement profile: headline, college, target role, skills, links and live practice stats.",
      },
      { property: "og:title", content: "My Profile — CodeDev" },
      { property: "og:description", content: "The recruiter-facing version of your preparation." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const fetchProfile = useServerFn(getFullProfile);
  const fetchProgress = useServerFn(getProgress);
  const fetchBadges = useServerFn(getAchievements);
  const save = useServerFn(updateProfile);

  const profile = useQuery({ queryKey: ["full-profile"], queryFn: () => fetchProfile() });
  const progress = useQuery({ queryKey: ["progress"], queryFn: () => fetchProgress() });
  const badges = useQuery({ queryKey: ["achievements"], queryFn: () => fetchBadges() });

  const mutation = useMutation({
    mutationFn: (patch: Parameters<typeof updateProfile>[0] extends never ? never : Record<string, unknown>) =>
      save({ data: patch as never }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["full-profile"] });
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const p = profile.data;

  const solvedByDifficulty = useMemo(() => {
    const solved = new Set(progress.data?.solved ?? []);
    const out = { Easy: 0, Medium: 0, Hard: 0 } as Record<string, number>;
    for (const pr of PROBLEMS) if (solved.has(String(pr.id))) out[pr.difficulty] = (out[pr.difficulty] ?? 0) + 1;
    return out;
  }, [progress.data]);

  const unlocked = badges.data?.unlocked?.length ?? 0;

  return (
    <AppShell title="Profile" subtitle="The version of you a recruiter would read">
      <PageSection className="space-y-6">
        {profile.isLoading || !p ? (
          <SkeletonCard lines={6} />
        ) : (
          <>
            <section className="mica overflow-hidden rounded-2xl">
              <div className="h-24 bg-gradient-primary" />
              <div className="-mt-10 px-6 pb-6">
                <div className="grid size-20 place-items-center rounded-2xl border-4 border-background bg-secondary text-2xl font-semibold">
                  {(p.display_name || user?.email || "?").slice(0, 1).toUpperCase()}
                </div>
                <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-semibold tracking-tight">{p.display_name || "Unnamed"}</h2>
                    <p className="text-sm text-muted-foreground">{p.headline || "Add a headline below"}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                      {p.college && (
                        <span className="flex items-center gap-1">
                          <GraduationCap className="size-3.5" />
                          {p.college}
                          {p.grad_year ? ` · ${p.grad_year}` : ""}
                        </span>
                      )}
                      {p.target_role && (
                        <span className="flex items-center gap-1">
                          <Target className="size-3.5" />
                          {p.target_role}
                        </span>
                      )}
                      {p.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3.5" />
                          {p.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <LinkChip href={p.github_url} icon={Github} label="GitHub" />
                    <LinkChip href={p.linkedin_url} icon={Linkedin} label="LinkedIn" />
                    <LinkChip href={p.portfolio_url} icon={Globe} label="Portfolio" />
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Level" value={p.level} hint={`${p.xp} XP total`} />
              <Stat label="Day streak" value={p.streak} hint="Keep it alive" />
              <Stat
                label="Problems solved"
                value={progress.data?.solved.length ?? 0}
                hint={`E ${solvedByDifficulty["Easy"] ?? 0} · M ${solvedByDifficulty["Medium"] ?? 0} · H ${solvedByDifficulty["Hard"] ?? 0}`}
              />
              <Stat label="Badges" value={unlocked} hint="Unlocked so far" />
            </section>

            <SkillsCard
              skills={p.skills ?? []}
              onChange={(skills) => mutation.mutate({ skills } as never)}
              saving={mutation.isPending}
            />

            <DetailsForm profile={p} onSave={(patch) => mutation.mutate(patch as never)} saving={mutation.isPending} />
          </>
        )}
      </PageSection>
    </AppShell>
  );
}

function LinkChip({
  href,
  icon: Icon,
  label,
}: {
  href: string | null;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-[11px] transition-colors hover:text-primary"
    >
      <Icon className="size-3.5" />
      {label}
    </a>
  );
}

function Stat({ label, value, hint }: { label: string; value: number | string; hint: string }) {
  return (
    <div className="mica rounded-2xl p-5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function SkillsCard({
  skills,
  onChange,
  saving,
}: {
  skills: string[];
  onChange: (skills: string[]) => void;
  saving: boolean;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const v = draft.trim();
    if (!v || skills.includes(v) || skills.length >= 30) return setDraft("");
    onChange([...skills, v]);
    setDraft("");
  };

  return (
    <section className="mica rounded-2xl p-5">
      <p className="text-sm font-semibold">Skills</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        List what you can defend in an interview, not everything you have heard of.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {skills.map((s) => (
          <span key={s} className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs">
            {s}
            <button
              aria-label={`Remove ${s}`}
              disabled={saving}
              onClick={() => onChange(skills.filter((x) => x !== s))}
              className="text-muted-foreground transition-colors hover:text-destructive"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        {skills.length === 0 && <p className="text-xs text-muted-foreground">No skills added yet.</p>}
      </div>
      <div className="mt-4 flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="e.g. React, PostgreSQL, System design"
          maxLength={30}
          className="max-w-xs"
        />
        <Button variant="secondary" onClick={add} disabled={saving}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>
    </section>
  );
}

function DetailsForm({
  profile,
  onSave,
  saving,
}: {
  profile: FullProfile;
  onSave: (patch: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    display_name: profile.display_name ?? "",
    headline: profile.headline ?? "",
    college: profile.college ?? "",
    grad_year: profile.grad_year ? String(profile.grad_year) : "",
    target_role: profile.target_role ?? "",
    location: profile.location ?? "",
    github_url: profile.github_url ?? "",
    linkedin_url: profile.linkedin_url ?? "",
    portfolio_url: profile.portfolio_url ?? "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = () => {
    const year = Number(form.grad_year);
    onSave({
      display_name: form.display_name.trim() || "Learner",
      headline: form.headline.trim() || null,
      college: form.college.trim() || null,
      grad_year: form.grad_year && Number.isFinite(year) ? year : null,
      target_role: form.target_role.trim() || null,
      location: form.location.trim() || null,
      github_url: form.github_url.trim() || null,
      linkedin_url: form.linkedin_url.trim() || null,
      portfolio_url: form.portfolio_url.trim() || null,
    });
  };

  return (
    <section className="mica rounded-2xl p-5">
      <p className="text-sm font-semibold">Profile details</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Display name" value={form.display_name} onChange={set("display_name")} />
        <Field label="Headline" value={form.headline} onChange={set("headline")} placeholder="Final-year CSE · backend-leaning" />
        <Field label="College" value={form.college} onChange={set("college")} />
        <Field label="Graduation year" value={form.grad_year} onChange={set("grad_year")} placeholder="2027" inputMode="numeric" />
        <Field label="Target role" value={form.target_role} onChange={set("target_role")} placeholder="SDE 1 — backend" />
        <Field label="Location" value={form.location} onChange={set("location")} placeholder="Bengaluru" />
        <Field label="GitHub URL" value={form.github_url} onChange={set("github_url")} placeholder="https://github.com/…" />
        <Field label="LinkedIn URL" value={form.linkedin_url} onChange={set("linkedin_url")} placeholder="https://linkedin.com/in/…" />
        <Field label="Portfolio URL" value={form.portfolio_url} onChange={set("portfolio_url")} placeholder="https://…" />
      </div>
      <Button className="mt-5" onClick={submit} disabled={saving}>
        {saving ? "Saving…" : "Save profile"}
      </Button>
    </section>
  );
}

function Field({
  label,
  ...rest
}: { label: string } & React.ComponentProps<typeof Input>) {
  return (
    <label className="space-y-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
      <Input {...rest} className="font-normal normal-case tracking-normal" />
    </label>
  );
}
