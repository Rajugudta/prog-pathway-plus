import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Flag, Rocket, Sparkles, Target } from "lucide-react";

import { AppShell, PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { ROADMAPS } from "@/data/roadmaps";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/roadmaps")({
  head: () => ({
    meta: [
      { title: "Roadmaps — CodeDev" },
      {
        name: "description",
        content:
          "Visual beginner-to-advanced learning roadmaps: tick off each step, watch your progress fill up, and ship a project at every checkpoint.",
      },
      { property: "og:title", content: "Roadmaps — CodeDev" },
      { property: "og:description", content: "Step-by-step visual plans from absolute beginner to offer-ready." },
    ],
  }),
  component: RoadmapsPage,
});

const STORAGE_KEY = "codedev.roadmap.done";

const LEVEL_STYLE: Record<string, string> = {
  Beginner: "bg-success/15 text-success border-success/30",
  Intermediate: "bg-warning/15 text-warning border-warning/30",
  Advanced: "bg-primary/15 text-primary border-primary/30",
};

function useDoneSteps() {
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setDone(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* first visit */
    }
  }, []);

  const toggle = (id: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        /* storage disabled */
      }
      return next;
    });
  };

  return { done, toggle };
}

function ProgressRing({ value }: { value: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 64 64" className="size-16 shrink-0 -rotate-90">
      <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" className="stroke-border" />
      <circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        strokeWidth="6"
        strokeLinecap="round"
        className="stroke-primary transition-all duration-500"
        strokeDasharray={c}
        strokeDashoffset={c - (c * value) / 100}
      />
      <text
        x="32"
        y="33"
        textAnchor="middle"
        dominantBaseline="middle"
        className="rotate-90 fill-foreground text-[15px] font-semibold"
        transform="rotate(90 32 32)"
      >
        {value}%
      </text>
    </svg>
  );
}

function RoadmapsPage() {
  const [activeId, setActiveId] = useState(ROADMAPS[0]?.id ?? "");
  const roadmap = ROADMAPS.find((r) => r.id === activeId) ?? ROADMAPS[0];
  const { done, toggle } = useDoneSteps();
  const [openPhase, setOpenPhase] = useState<string | null>(roadmap?.phases[0]?.id ?? null);

  const stats = useMemo(() => {
    if (!roadmap) return { total: 0, complete: 0, percent: 0, hours: 0, hoursLeft: 0 };
    const steps = roadmap.phases.flatMap((p) => p.steps);
    const complete = steps.filter((s) => done.has(s.id)).length;
    const hours = steps.reduce((sum, s) => sum + s.hours, 0);
    const hoursLeft = steps.filter((s) => !done.has(s.id)).reduce((sum, s) => sum + s.hours, 0);
    return {
      total: steps.length,
      complete,
      percent: steps.length ? Math.round((complete / steps.length) * 100) : 0,
      hours,
      hoursLeft,
    };
  }, [roadmap, done]);

  const nextStep = useMemo(() => {
    if (!roadmap) return null;
    for (const phase of roadmap.phases) {
      for (const step of phase.steps) {
        if (!done.has(step.id)) return { phase, step };
      }
    }
    return null;
  }, [roadmap, done]);

  if (!roadmap) return null;

  return (
    <AppShell title="Roadmaps" subtitle="Tick off each step and watch the path light up — beginner to offer-ready">
      <PageSection>
        <div className="flex flex-wrap gap-2">
          {ROADMAPS.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setActiveId(r.id);
                setOpenPhase(r.phases[0]?.id ?? null);
              }}
              className={cn(
                "rounded-full border border-border px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground",
                r.id === roadmap.id && "bg-secondary text-foreground",
              )}
            >
              {r.title}
            </button>
          ))}
        </div>

        {/* Overview */}
        <div className="mica mt-6 rounded-2xl p-6">
          <div className="flex flex-wrap items-center gap-5">
            <ProgressRing value={stats.percent} />
            <div className="min-w-[220px] flex-1">
              <h2 className="text-lg font-semibold tracking-tight">{roadmap.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{roadmap.tagline}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {roadmap.totalWeeks} weeks · {roadmap.audience} · {stats.complete}/{stats.total} steps done ·{" "}
                {stats.hoursLeft}h of {stats.hours}h left
              </p>
            </div>
          </div>

          {nextStep && (
            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4">
              <Target className="size-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">You are here — next step</p>
                <p className="truncate text-sm font-medium">{nextStep.step.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {nextStep.phase.name} · ~{nextStep.step.hours}h
                </p>
              </div>
              <Button
                size="sm"
                variant="hero"
                onClick={() => {
                  setOpenPhase(nextStep.phase.id);
                  toggle(nextStep.step.id);
                }}
              >
                <Check className="mr-1.5 size-4" /> Mark done
              </Button>
            </div>
          )}
        </div>

        {/* Phase rail */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {roadmap.phases.map((phase, i) => {
            const steps = phase.steps;
            const complete = steps.filter((s) => done.has(s.id)).length;
            const pct = steps.length ? Math.round((complete / steps.length) * 100) : 0;
            return (
              <button
                key={phase.id}
                onClick={() => setOpenPhase(phase.id)}
                className={cn(
                  "mica rounded-2xl p-4 text-left transition-colors",
                  openPhase === phase.id && "ring-1 ring-primary/40",
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "grid size-7 place-items-center rounded-lg text-[11px] font-bold",
                      pct === 100
                        ? "bg-success text-background"
                        : "bg-gradient-primary text-primary-foreground",
                    )}
                  >
                    {pct === 100 ? <Check className="size-3.5" /> : i + 1}
                  </span>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px]",
                      LEVEL_STYLE[phase.level] ?? "border-border text-muted-foreground",
                    )}
                  >
                    {phase.level}
                  </span>
                </div>
                <p className="mt-2.5 text-sm font-medium leading-snug">{phase.name}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{phase.weeks}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gradient-primary transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Timeline */}
        <div className="mt-6 space-y-4">
          {roadmap.phases.map((phase, i) => {
            const isOpen = openPhase === phase.id;
            const complete = phase.steps.filter((s) => done.has(s.id)).length;
            return (
              <section key={phase.id} className="mica overflow-hidden rounded-2xl">
                <button
                  onClick={() => setOpenPhase(isOpen ? null : phase.id)}
                  className="flex w-full items-center gap-3 p-5 text-left"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold tracking-tight">{phase.name}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {phase.level} · {phase.weeks} · {complete}/{phase.steps.length} steps done
                    </p>
                  </div>
                  <ChevronDown
                    className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-6">
                    <p className="rounded-xl border border-border bg-secondary/50 p-4 text-sm text-muted-foreground">
                      <Flag className="mr-2 inline size-3.5 text-primary" />
                      {phase.goal}
                    </p>

                    <ol className="mt-5 space-y-5 border-l-2 border-dashed border-border pl-6">
                      {phase.steps.map((step) => {
                        const isDone = done.has(step.id);
                        return (
                          <li key={step.id} className="relative">
                            <button
                              type="button"
                              onClick={() => toggle(step.id)}
                              aria-pressed={isDone}
                              className={cn(
                                "absolute -left-[33px] top-0.5 grid size-5 place-items-center rounded-full border-2 bg-background transition-colors",
                                isDone ? "border-success text-success" : "border-border hover:border-primary",
                              )}
                            >
                              {isDone && <Check className="size-3" />}
                            </button>
                            <div className="flex flex-wrap items-baseline gap-x-2">
                              <p className={cn("text-sm font-medium", isDone && "text-muted-foreground line-through")}>
                                {step.title}
                              </p>
                              <span className="text-[11px] text-muted-foreground">~{step.hours}h</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              <Sparkles className="mr-1 inline size-3 text-primary" />
                              {step.outcome}
                            </p>
                            <ul className="mt-2 space-y-1">
                              {step.tasks.map((task) => (
                                <li key={task} className="text-xs leading-relaxed text-muted-foreground">
                                  — {task}
                                </li>
                              ))}
                            </ul>
                          </li>
                        );
                      })}
                    </ol>

                    <p className="mt-6 rounded-xl border border-primary/30 bg-primary/10 p-4 text-xs text-muted-foreground">
                      <Rocket className="mr-2 inline size-3.5 text-primary" />
                      <span className="text-foreground">Ship it:</span> {phase.project}
                    </p>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </PageSection>
    </AppShell>
  );
}
