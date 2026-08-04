import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageSection } from "@/components/AppShell";
import { APTITUDE_TOPICS, HIRING_BARS, HR_QUESTIONS, NEGOTIATION_TIPS, RESUME_RULES } from "@/data/placement";

export const Route = createFileRoute("/_authenticated/placement")({
  head: () => ({
    meta: [
      { title: "Placement Hub — CodeDev" },
      { name: "description", content: "ATS-safe resume rewrites, aptitude drills, HR answer frameworks, company hiring bars and salary negotiation scripts." },
      { property: "og:title", content: "Placement Hub — CodeDev" },
      { property: "og:description", content: "Everything between your last practice problem and a signed offer." },
    ],
  }),
  component: PlacementPage,
});

function PlacementPage() {
  return (
    <AppShell title="Placement Hub" subtitle="Resume, aptitude, HR rounds, hiring bars and negotiation — no fluff">
      <PageSection className="space-y-8">
        <section>
          <h2 className="text-base font-semibold tracking-tight">Resume rewrites that pass ATS</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {RESUME_RULES.map((r) => (
              <article key={r.label} className="mica rounded-2xl p-5">
                <p className="text-sm font-medium">{r.label}</p>
                <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-muted-foreground">
                  {r.bad}
                </p>
                <p className="mt-2 rounded-lg border border-success/30 bg-success/10 p-3 text-xs text-foreground">
                  {r.good}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold tracking-tight">Aptitude, weighted by what actually appears</h2>
          <div className="mica mt-4 divide-y divide-border rounded-2xl">
            {APTITUDE_TOPICS.map((t) => (
              <div key={t.topic} className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{t.topic}</p>
                  <span className="text-[11px] text-muted-foreground">{t.weight}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{t.drills.join(" · ")}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold tracking-tight">HR round, with the trap named</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {HR_QUESTIONS.map((q) => (
              <article key={q.q} className="mica rounded-2xl p-5">
                <p className="text-sm font-medium">{q.q}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  <span className="text-foreground">Framework:</span> {q.framework}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="text-warning">Trap:</span> {q.trap}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div>
            <h2 className="text-base font-semibold tracking-tight">Company hiring bars</h2>
            <div className="mica mt-4 divide-y divide-border rounded-2xl">
              {HIRING_BARS.map((c) => (
                <div key={c.company} className="p-5">
                  <p className="text-sm font-medium">{c.company}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{c.rounds}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{c.bar}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight">Negotiation scripts</h2>
            <div className="mt-4 space-y-3">
              {NEGOTIATION_TIPS.map((t) => (
                <article key={t.title} className="mica rounded-2xl p-5">
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </PageSection>
    </AppShell>
  );
}
