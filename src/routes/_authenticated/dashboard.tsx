import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  Braces,
  BookOpen,
  Flame,
  GraduationCap,
  Mic,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { AppShell, PageSection } from "@/components/AppShell";
import { SkeletonCard, SkeletonGrid } from "@/components/states";
import { getProfile, getProgress } from "@/lib/app.functions";
import { PROBLEMS, PROBLEM_COUNT } from "@/data/problems";
import { LECTURES } from "@/data/lectures";
import { MOCK_INTERVIEWS } from "@/data/interviews";
import { ROADMAPS } from "@/data/roadmaps";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — CodeDev" },
      {
        name: "description",
        content: "Your placement readiness score, streak, XP, solved problems and today's recommended next step.",
      },
      { property: "og:title", content: "Dashboard — CodeDev" },
      { property: "og:description", content: "Track your placement prep in one premium dashboard." },
    ],
  }),
  component: Dashboard,
});

const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  delay = 0,
}: {
  icon: typeof Flame;
  label: string;
  value: string;
  hint: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      className="mica fluent-reveal rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4 text-accent" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </motion.div>
  );
}

function ReadinessRing({ score }: { score: number }) {
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative grid size-[168px] shrink-0 place-items-center">
      <svg viewBox="0 0 160 160" className="size-full -rotate-90">
        <circle cx="80" cy="80" r={radius} fill="none" strokeWidth="12" className="stroke-secondary" />
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          className="stroke-primary"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - score / 100) }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-4xl font-bold tracking-tight">{score}</p>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Readiness</p>
      </div>
    </div>
  );
}

function Bar({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {value}/{total}
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="h-full rounded-full bg-gradient-primary"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  title,
  description,
}: {
  to: string;
  icon: typeof Mic;
  title: string;
  description: string;
}) {
  return (
    <Link to={to} className="mica fluent-reveal group rounded-2xl p-5">
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-xl bg-secondary text-accent">
          <Icon className="size-4" />
        </span>
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        <ArrowUpRight className="ml-auto size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
      <p className="mt-2.5 text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}

function Dashboard() {
  const profileFn = useServerFn(getProfile);
  const progressFn = useServerFn(getProgress);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => profileFn({}),
  });
  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ["progress"],
    queryFn: () => progressFn({}),
  });
  const loading = profileLoading || progressLoading;

  const solvedIds = progress?.solved ?? [];
  const watchedIds = progress?.watched ?? [];
  const solved = solvedIds.length;
  const watched = watchedIds.length;

  const byDifficulty = DIFFICULTIES.map((difficulty) => {
    const pool = PROBLEMS.filter((p) => p.difficulty === difficulty);
    return {
      difficulty,
      total: pool.length,
      done: pool.filter((p) => solvedIds.includes(p.slug)).length,
    };
  });

  const problemScore = Math.min(1, solved / 120) * 45;
  const lectureScore = Math.min(1, watched / Math.max(1, LECTURES.length)) * 25;
  const streakScore = Math.min(1, (profile?.streak ?? 0) / 21) * 15;
  const xpScore = Math.min(1, (profile?.xp ?? 0) / 3000) * 15;
  const readiness = Math.round(problemScore + lectureScore + streakScore + xpScore);

  const readinessLabel =
    readiness >= 75 ? "Interview ready" : readiness >= 45 ? "Building momentum" : "Just getting started";

  const nextProblem = PROBLEMS.find((p) => !solvedIds.includes(p.slug)) ?? PROBLEMS[0];
  const nextLecture = LECTURES.find((l) => !watchedIds.includes(l.id)) ?? LECTURES[0];

  return (
    <AppShell
      title={`Hey ${profile?.display_name ?? "there"} 👋`}
      subtitle="Small daily reps beat heroic weekends. Here's today's move."
    >
      <PageSection>
        {loading ? (
          <SkeletonGrid count={4} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              icon={Flame}
              label="Streak"
              value={`${profile?.streak ?? 1} days`}
              hint="Keep it alive — one problem counts."
              delay={0}
            />
            <Stat icon={Trophy} label="XP" value={`${profile?.xp ?? 0}`} hint={`Level ${profile?.level ?? 1}`} delay={0.05} />
            <Stat
              icon={Braces}
              label="Problems solved"
              value={`${solved}/${PROBLEM_COUNT}`}
              hint="Easy → hard, all languages."
              delay={0.1}
            />
            <Stat
              icon={BookOpen}
              label="Lectures watched"
              value={`${watched}/${LECTURES.length}`}
              hint="All playable inside the app."
              delay={0.15}
            />
          </div>
        )}

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {loading ? (
            <>
              <SkeletonCard className="lg:col-span-2" lines={4} />
              <SkeletonCard lines={4} />
            </>
          ) : (
            <>
              <div className="mica rounded-2xl p-6 lg:col-span-2">
                <div className="grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
                  <ReadinessRing score={readiness} />
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
                      <Target className="size-3 text-accent" /> {readinessLabel}
                    </span>
                    <h2 className="mt-3 text-lg font-semibold tracking-tight">Placement readiness</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Weighted across problem coverage, lectures completed, consistency and XP.
                    </p>
                    <div className="mt-4 space-y-3">
                      {byDifficulty.map((row) => (
                        <Bar key={row.difficulty} label={row.difficulty} value={row.done} total={row.total} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Link to="/problems" className="mica fluent-reveal group rounded-2xl p-6">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Next problem</span>
                <h2 className="mt-2 flex items-center gap-2 text-base font-semibold tracking-tight">
                  {nextProblem?.title}
                  <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{nextProblem?.statement}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1",
                      nextProblem?.difficulty === "Easy" && "border-success/40 text-success",
                      nextProblem?.difficulty === "Medium" && "border-warning/40 text-warning",
                      nextProblem?.difficulty === "Hard" && "border-destructive/40 text-destructive",
                    )}
                  >
                    {nextProblem?.difficulty}
                  </span>
                  <span className="rounded-full border border-border px-2.5 py-1">{nextProblem?.topic}</span>
                </div>
              </Link>
            </>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Link to="/learn" className="mica fluent-reveal group rounded-2xl p-6">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Continue learning</span>
            <h2 className="mt-2 text-base font-semibold tracking-tight">{nextLecture?.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {nextLecture?.author} · {nextLecture?.minutes} min
            </p>
          </Link>
          <Link to="/roadmaps" className="mica fluent-reveal group rounded-2xl p-6">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Follow a roadmap</span>
            <h2 className="mt-2 text-base font-semibold tracking-tight">
              {ROADMAPS.length} plans, beginner to offer-ready
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">Week-by-week milestones with hours and project goals.</p>
          </Link>
        </div>

        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Quick actions</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            to="/tutor"
            icon={Sparkles}
            title="Ask the AI tutor"
            description="Every thread is saved, so you can pick a topic back up next week."
          />
          <QuickAction
            to="/interviews"
            icon={Mic}
            title="Run a mock interview"
            description={`${MOCK_INTERVIEWS.length} personas that probe, push back and score you honestly.`}
          />
          <QuickAction
            to="/dsa"
            icon={Braces}
            title="DSA Academy"
            description="Structured modules with quizzes graded on the server."
          />
          <QuickAction
            to="/placement"
            icon={GraduationCap}
            title="Placement Hub"
            description="Resume rules, aptitude weightage and company hiring bars."
          />
        </div>
      </PageSection>
    </AppShell>
  );
}
