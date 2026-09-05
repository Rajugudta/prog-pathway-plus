import { Award, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type InterviewReport = {
  overall: number;
  verdict: string;
  recommendation: "strong-hire" | "hire" | "borderline" | "no-hire";
  scores: {
    communication: number;
    problemSolving: number;
    technicalDepth: number;
    structure: number;
    confidence: number;
  };
  strengths: string[];
  improvements: { title: string; detail: string }[];
  missedPoints: string[];
  betterAnswer: string;
  nextSteps: string[];
};

const RECOMMENDATION_LABEL: Record<InterviewReport["recommendation"], string> = {
  "strong-hire": "Strong hire",
  hire: "Hire",
  borderline: "Borderline",
  "no-hire": "Not yet",
};

const SCORE_LABELS: { key: keyof InterviewReport["scores"]; label: string }[] = [
  { key: "communication", label: "Communication" },
  { key: "problemSolving", label: "Problem solving" },
  { key: "technicalDepth", label: "Technical depth" },
  { key: "structure", label: "Structure" },
  { key: "confidence", label: "Confidence" },
];

export function InterviewReportCard({
  report,
  durationSeconds,
  turns,
  onRetry,
}: {
  report: InterviewReport;
  durationSeconds: number;
  turns: { role: "interviewer" | "candidate"; text: string; audioUrl?: string }[];
  onRetry: () => void;
}) {
  const minutes = Math.max(1, Math.round(durationSeconds / 60));
  const answered = turns.filter((t) => t.role === "candidate").length;

  return (
    <div className="flex flex-col gap-5">
      <section className="mica rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Performance report</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">{RECOMMENDATION_LABEL[report.recommendation]}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {minutes} min · {answered} answers
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-mono text-3xl tabular-nums">{Math.round(report.overall)}</p>
              <p className="text-[11px] text-muted-foreground">out of 100</p>
            </div>
            <Award className="size-6 text-accent" />
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{report.verdict}</p>
      </section>

      <section className="mica rounded-2xl p-6">
        <h3 className="text-sm font-semibold tracking-tight">Scorecard</h3>
        <div className="mt-4 flex flex-col gap-3">
          {SCORE_LABELS.map(({ key, label }) => {
            const value = report.scores[key];
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-xs text-muted-foreground">{label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      value >= 8 ? "bg-success" : value >= 5 ? "bg-accent" : "bg-destructive",
                    )}
                    style={{ width: `${(value / 10) * 100}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right font-mono text-xs tabular-nums">{value}</span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="mica rounded-2xl p-6">
          <h3 className="text-sm font-semibold tracking-tight">What worked</h3>
          <ul className="mt-3 flex flex-col gap-2 text-xs leading-relaxed text-muted-foreground">
            {report.strengths.map((s) => (
              <li key={s}>· {s}</li>
            ))}
          </ul>
        </section>
        <section className="mica rounded-2xl p-6">
          <h3 className="text-sm font-semibold tracking-tight">Missed points</h3>
          <ul className="mt-3 flex flex-col gap-2 text-xs leading-relaxed text-muted-foreground">
            {report.missedPoints.length === 0 ? (
              <li>Nothing major slipped past you.</li>
            ) : (
              report.missedPoints.map((s) => <li key={s}>· {s}</li>)
            )}
          </ul>
        </section>
      </div>

      <section className="mica rounded-2xl p-6">
        <h3 className="text-sm font-semibold tracking-tight">Fix these next</h3>
        <div className="mt-3 flex flex-col gap-4">
          {report.improvements.map((i) => (
            <div key={i.title}>
              <p className="text-sm font-medium">{i.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{i.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mica rounded-2xl p-6">
        <h3 className="text-sm font-semibold tracking-tight">How a strong answer sounds</h3>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{report.betterAnswer}</p>
      </section>

      {report.nextSteps.length > 0 && (
        <section className="mica rounded-2xl p-6">
          <h3 className="text-sm font-semibold tracking-tight">Your next steps</h3>
          <ul className="mt-3 flex flex-col gap-2 text-xs leading-relaxed text-muted-foreground">
            {report.nextSteps.map((s) => (
              <li key={s}>· {s}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="mica rounded-2xl p-6">
        <h3 className="text-sm font-semibold tracking-tight">Session recording</h3>
        <div className="mt-4 flex flex-col gap-4">
          {turns.map((t, i) => (
            <div key={i} className="border-l-2 border-border pl-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {t.role === "interviewer" ? "Interviewer" : "You"}
              </p>
              <p className="mt-1 text-sm leading-relaxed">{t.text}</p>
              {t.audioUrl && <audio controls src={t.audioUrl} className="mt-2 h-8 w-64 max-w-full" preload="none" />}
            </div>
          ))}
        </div>
      </section>

      <div className="pb-4 text-center">
        <Button variant="hero" onClick={onRetry}>
          <RotateCcw className="mr-1.5 size-4" /> Run this interview again
        </Button>
      </div>
    </div>
  );
}
