import { createFileRoute, Link } from "@tanstack/react-router";
import { Mic } from "lucide-react";
import { AppShell, PageSection } from "@/components/AppShell";
import { MOCK_INTERVIEWS } from "@/data/interviews";

export const Route = createFileRoute("/_authenticated/interviews/")({
  head: () => ({
    meta: [
      { title: "Interview Studio — CodeDev" },
      { name: "description", content: "15 human-feeling mock interviews across DSA, system design, frontend, backend and HR rounds, with honest scored debriefs." },
      { property: "og:title", content: "Interview Studio — CodeDev" },
      { property: "og:description", content: "Practice with realistic interviewer personas and get a hiring-manager debrief." },
    ],
  }),
  component: InterviewsIndex,
});

function InterviewsIndex() {
  return (
    <AppShell title="Interview Studio" subtitle={`${MOCK_INTERVIEWS.length} personas that behave like real interviewers`}>
      <PageSection>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {MOCK_INTERVIEWS.map((it) => (
            <Link
              key={it.id}
              to="/interviews/$interviewId"
              params={{ interviewId: it.id }}
              className="mica flex flex-col rounded-2xl p-6 transition-transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
                  {it.company}
                </span>
                <span className="text-[11px] text-muted-foreground">{it.difficulty}</span>
              </div>
              <h2 className="mt-3 text-sm font-semibold leading-snug tracking-tight">{it.title}</h2>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">{it.whatToExpect}</p>
              <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
                <Mic className="size-3.5 text-accent" />
                {it.interviewer} · {it.durationMinutes} min
              </div>
            </Link>
          ))}
        </div>
      </PageSection>
    </AppShell>
  );
}
