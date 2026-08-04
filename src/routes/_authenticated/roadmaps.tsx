import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageSection } from "@/components/AppShell";
import { ROADMAPS } from "@/data/roadmaps";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/roadmaps")({
  head: () => ({
    meta: [
      { title: "Roadmaps — CodeDev" },
      { name: "description", content: "Beginner to advanced learning roadmaps with weekly milestones, hour budgets and a project at the end of every phase." },
      { property: "og:title", content: "Roadmaps — CodeDev" },
      { property: "og:description", content: "Step-by-step plans from absolute beginner to offer-ready." },
    ],
  }),
  component: RoadmapsPage,
});

function RoadmapsPage() {
  const [activeId, setActiveId] = useState(ROADMAPS[0]?.id ?? "");
  const roadmap = ROADMAPS.find((r) => r.id === activeId) ?? ROADMAPS[0];

  return (
    <AppShell title="Roadmaps" subtitle="Beginner → advanced, week by week, with a project at every checkpoint">
      <PageSection>
        <div className="flex flex-wrap gap-2">
          {ROADMAPS.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveId(r.id)}
              className={cn(
                "rounded-full border border-border px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground",
                r.id === roadmap?.id && "bg-secondary text-foreground",
              )}
            >
              {r.title}
            </button>
          ))}
        </div>

        {roadmap && (
          <>
            <div className="mica mt-6 rounded-2xl p-6">
              <h2 className="text-lg font-semibold tracking-tight">{roadmap.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{roadmap.tagline}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {roadmap.totalWeeks} weeks · {roadmap.audience}
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {roadmap.phases.map((phase, i) => (
                <section key={phase.id} className="mica rounded-2xl p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="grid size-8 place-items-center rounded-xl bg-gradient-primary text-xs font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                    <h3 className="text-base font-semibold tracking-tight">{phase.name}</h3>
                    <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
                      {phase.level} · {phase.weeks}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{phase.goal}</p>

                  <ol className="mt-5 space-y-4 border-l border-border pl-5">
                    {phase.steps.map((step) => (
                      <li key={step.id} className="relative">
                        <span className="absolute -left-[27px] top-1.5 size-2.5 rounded-full bg-accent" />
                        <p className="text-sm font-medium">{step.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{step.outcome} · ~{step.hours}h</p>
                        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                          {step.tasks.map((task) => (
                            <li key={task}>— {task}</li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ol>

                  <p className="mt-5 rounded-xl border border-border bg-secondary/60 p-4 text-xs text-muted-foreground">
                    <span className="text-foreground">Ship it:</span> {phase.project}
                  </p>
                </section>
              ))}
            </div>
          </>
        )}
      </PageSection>
    </AppShell>
  );
}
