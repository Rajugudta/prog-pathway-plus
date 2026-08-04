import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight, Braces, BookOpen, Flame, Mic, Trophy } from "lucide-react";
import { AppShell, PageSection } from "@/components/AppShell";
import { getProfile, getProgress } from "@/lib/app.functions";
import { PROBLEMS, PROBLEM_COUNT } from "@/data/problems";
import { LECTURES } from "@/data/lectures";
import { MOCK_INTERVIEWS } from "@/data/interviews";
import { ROADMAPS } from "@/data/roadmaps";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — CodeDev" },
      { name: "description", content: "Your streak, XP, solved problems, watched lectures and what to do next." },
      { property: "og:title", content: "Dashboard — CodeDev" },
      { property: "og:description", content: "Track your engineering prep in one place." },
    ],
  }),
  component: Dashboard,
});

function Stat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Flame;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="mica rounded-2xl p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4 text-accent" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function Dashboard() {
  const profileFn = useServerFn(getProfile);
  const progressFn = useServerFn(getProgress);

  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: () => profileFn({}) });
  const { data: progress } = useQuery({ queryKey: ["progress"], queryFn: () => progressFn({}) });

  const solved = progress?.solved.length ?? 0;
  const watched = progress?.watched.length ?? 0;
  const nextProblem = PROBLEMS.find((p) => !progress?.solved.includes(p.slug)) ?? PROBLEMS[0];
  const nextLecture = LECTURES.find((l) => !progress?.watched.includes(l.id)) ?? LECTURES[0];

  return (
    <AppShell
      title={`Hey ${profile?.display_name ?? "there"} 👋`}
      subtitle="Small daily reps beat heroic weekends. Here's today's move."
    >
      <PageSection>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={Flame} label="Streak" value={`${profile?.streak ?? 1} days`} hint="Keep it alive — one problem counts." />
          <Stat icon={Trophy} label="XP" value={`${profile?.xp ?? 0}`} hint={`Level ${profile?.level ?? 1}`} />
          <Stat icon={Braces} label="Problems solved" value={`${solved}/${PROBLEM_COUNT}`} hint="Easy → hard, all languages." />
          <Stat icon={BookOpen} label="Lectures watched" value={`${watched}/${LECTURES.length}`} hint="All playable inside the app." />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Link
            to="/problems"
            className="mica group rounded-2xl p-6 transition-transform hover:-translate-y-1 lg:col-span-2"
          >
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Next problem</span>
            <h2 className="mt-2 flex items-center gap-2 text-lg font-semibold tracking-tight">
              {nextProblem?.title}
              <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </h2>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{nextProblem?.statement}</p>
            <div className="mt-4 flex gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border px-2.5 py-1">{nextProblem?.difficulty}</span>
              <span className="rounded-full border border-border px-2.5 py-1">{nextProblem?.topic}</span>
            </div>
          </Link>

          <Link to="/learn" className="mica group rounded-2xl p-6 transition-transform hover:-translate-y-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Next lecture</span>
            <h2 className="mt-2 text-base font-semibold tracking-tight">{nextLecture?.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {nextLecture?.author} · {nextLecture?.minutes} min
            </p>
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Link to="/tutor" className="mica rounded-2xl p-6 transition-transform hover:-translate-y-1">
            <h3 className="text-base font-semibold tracking-tight">Ask Aria something hard</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your AI tutor keeps every thread, so you can pick a conversation back up next week.
            </p>
          </Link>
          <Link to="/interviews" className="mica rounded-2xl p-6 transition-transform hover:-translate-y-1">
            <h3 className="flex items-center gap-2 text-base font-semibold tracking-tight">
              <Mic className="size-4 text-accent" /> Run a mock interview
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {MOCK_INTERVIEWS.length} personas that probe, push back and score you honestly.
            </p>
          </Link>
          <Link to="/roadmaps" className="mica rounded-2xl p-6 transition-transform hover:-translate-y-1">
            <h3 className="text-base font-semibold tracking-tight">Follow a roadmap</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {ROADMAPS.length} plans from absolute beginner to offer-ready, week by week.
            </p>
          </Link>
        </div>
      </PageSection>
    </AppShell>
  );
}
