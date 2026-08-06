import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, Save, AlertTriangle, Gauge, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { Problem } from "@/data/problems";
import { getSolution, reviewSolution, saveSolution } from "@/lib/achievements.functions";
import { cn } from "@/lib/utils";

const STATUS_COPY: Record<string, { label: string; className: string }> = {
  "correct-optimal": { label: "Correct & optimal", className: "text-emerald-400" },
  "correct-slow": { label: "Correct, can be faster", className: "text-yellow-400" },
  buggy: { label: "Has a bug", className: "text-destructive" },
  incomplete: { label: "Incomplete", className: "text-muted-foreground" },
};

const IMPACT: Record<string, string> = {
  high: "bg-destructive/15 text-destructive",
  medium: "bg-yellow-500/15 text-yellow-400",
  low: "bg-secondary text-muted-foreground",
};

export function CodeReviewPanel({ problem, language }: { problem: Problem; language: string }) {
  const starter = problem.starter[language] ?? problem.starter[problem.languages[0] ?? ""] ?? "";
  const [code, setCode] = useState(starter);
  const [touched, setTouched] = useState(false);

  const getSolutionFn = useServerFn(getSolution);
  const reviewFn = useServerFn(reviewSolution);
  const saveFn = useServerFn(saveSolution);

  const saved = useQuery({
    queryKey: ["solution", problem.slug],
    queryFn: () => getSolutionFn({ data: { problemId: problem.slug } }),
  });

  useEffect(() => {
    // Prefer the learner's saved attempt, otherwise the starter for the active language.
    if (touched) return;
    if (saved.data?.code) setCode(saved.data.code);
    else setCode(starter);
  }, [saved.data?.code, starter, touched]);

  const review = useMutation({
    mutationFn: () =>
      reviewFn({
        data: {
          problemId: problem.slug,
          title: problem.title,
          statement: problem.statement,
          difficulty: problem.difficulty,
          topic: problem.topic,
          language,
          code,
        },
      }),
    onError: (e: Error) => toast.error("Review failed", { description: e.message }),
  });

  const save = useMutation({
    mutationFn: () => saveFn({ data: { problemId: problem.slug, language, code } }),
    onSuccess: () => toast.success("Solution saved"),
  });

  const result = review.data ?? saved.data?.review ?? null;
  const status = result ? STATUS_COPY[result.status] : null;

  return (
    <div className="mt-4 space-y-4">
      <textarea
        value={code}
        spellCheck={false}
        onChange={(e) => {
          setTouched(true);
          setCode(e.target.value);
        }}
        rows={14}
        className="w-full resize-y rounded-xl border border-border bg-background/70 p-4 font-mono text-xs leading-relaxed outline-none focus:ring-1 focus:ring-ring"
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="hero" disabled={review.isPending || code.trim().length < 10} onClick={() => review.mutate()}>
          {review.isPending ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : <Sparkles className="mr-1.5 size-4" />}
          {review.isPending ? "Reviewing…" : "Review my code"}
        </Button>
        <Button variant="mica" disabled={save.isPending} onClick={() => save.mutate()}>
          <Save className="mr-1.5 size-4" />
          Save draft
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { setTouched(true); setCode(starter); }}>
          Reset to starter
        </Button>
      </div>

      {result && (
        <div className="space-y-4 rounded-xl border border-border bg-background/50 p-4">
          <div>
            {status && <p className={cn("text-[11px] font-medium uppercase tracking-wide", status.className)}>{status.label}</p>}
            <p className="mt-1 text-sm font-medium">{result.verdict}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <ComplexityCard title="Your solution" value={result.yourComplexity} />
            <ComplexityCard title="Optimal" value={result.optimalComplexity} />
          </div>

          {result.issues.length > 0 && (
            <div className="space-y-2">
              <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <AlertTriangle className="size-3.5" /> Issues
              </h4>
              {result.issues.map((issue, i) => (
                <div key={i} className="rounded-lg border border-border/70 p-3">
                  <p className="text-sm font-medium">{issue.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{issue.detail}</p>
                  <p className="mt-1.5 text-xs text-foreground/90">Fix: {issue.fix}</p>
                </div>
              ))}
            </div>
          )}

          {result.improvements.length > 0 && (
            <div className="space-y-2">
              <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Wand2 className="size-3.5" /> Concrete improvements
              </h4>
              {result.improvements.map((imp, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className={cn("mt-0.5 rounded-full px-2 py-0.5 text-[10px] uppercase", IMPACT[imp.impact])}>
                    {imp.impact}
                  </span>
                  <p className="text-xs leading-relaxed text-muted-foreground">{imp.text}</p>
                </div>
              ))}
            </div>
          )}

          {result.rewrite && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cleaner version</h4>
              <pre className="mt-2 overflow-x-auto rounded-lg border border-border bg-background/70 p-3 font-mono text-[11px] leading-relaxed">
                {result.rewrite}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ComplexityCard({ title, value }: { title: string; value: { time: string; space: string } }) {
  return (
    <div className="rounded-lg border border-border/70 p-3">
      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
        <Gauge className="size-3.5" /> {title}
      </p>
      <p className="mt-1 font-mono text-xs">time {value.time}</p>
      <p className="font-mono text-xs">space {value.space}</p>
    </div>
  );
}
