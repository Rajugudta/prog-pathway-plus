import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, ListChecks, Play, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { AppShell, PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { DSA_LECTURES, DSA_MODULES, type DsaLecture } from "@/data/dsa-lectures";
import { getProgress, toggleLectureComplete } from "@/lib/app.functions";
import { getQuizResults, submitQuiz } from "@/lib/quiz.functions";
import { celebrateBadges } from "@/lib/celebrate";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dsa")({
  head: () => ({
    meta: [
      { title: "DSA Academy — CodeDev" },
      {
        name: "description",
        content:
          "A structured data structures and algorithms course that plays inside the app, with tracked progress and a graded comprehension quiz after every lecture.",
      },
      { property: "og:title", content: "DSA Academy — CodeDev" },
      {
        property: "og:description",
        content: "Twelve DSA modules, in-app player, progress tracking and comprehension quizzes.",
      },
    ],
  }),
  component: DsaPage,
});

function DsaPage() {
  const [module, setModule] = useState("All");
  const [active, setActive] = useState<DsaLecture | null>(null);

  const progressFn = useServerFn(getProgress);
  const toggleFn = useServerFn(toggleLectureComplete);
  const quizResultsFn = useServerFn(getQuizResults);
  const qc = useQueryClient();

  const { data: progress } = useQuery({ queryKey: ["progress"], queryFn: () => progressFn({}) });
  const { data: quizzes } = useQuery({ queryKey: ["quiz-results"], queryFn: () => quizResultsFn({}) });
  const watched = progress?.watched ?? [];
  const passedIds = (quizzes ?? []).filter((q) => q.passed).map((q) => q.lecture_id);

  const mark = useMutation({
    mutationFn: (vars: { lectureId: string; completed: boolean }) => toggleFn({ data: vars }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["progress"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["achievements"] });
      if (res?.reward) {
        toast.success(`+${res.reward.awarded} XP`, {
          description: res.reward.leveledUp
            ? `Level ${res.reward.level} unlocked · ${res.reward.streak} day streak`
            : `${res.reward.xp} XP total · ${res.reward.streak} day streak`,
        });
        celebrateBadges(res.reward.unlocked);
      }
    },
  });

  const list = useMemo(
    () => DSA_LECTURES.filter((l) => module === "All" || l.module === module),
    [module],
  );

  const completion = Math.round(
    (DSA_LECTURES.filter((l) => watched.includes(l.id)).length / DSA_LECTURES.length) * 100,
  );

  return (
    <AppShell
      title="DSA Academy"
      subtitle={`${DSA_LECTURES.length} modules · ${completion}% watched · ${passedIds.length} quizzes passed`}
    >
      <PageSection>
        {active && (
          <div className="mb-6 space-y-4">
            <div className="mica overflow-hidden rounded-2xl">
              <div className="aspect-video w-full bg-black">
                <iframe
                  key={active.id}
                  className="h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${active.videoId}?rel=0&modestbranding=1&autoplay=1`}
                  title={active.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold tracking-tight">{active.title}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {active.author} · {active.module} · {active.level} · {active.minutes} min
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={watched.includes(active.id) ? "secondary" : "hero"}
                    size="sm"
                    onClick={() =>
                      mark.mutate({ lectureId: active.id, completed: !watched.includes(active.id) })
                    }
                  >
                    <Check className="mr-1.5 size-4" />
                    {watched.includes(active.id) ? "Completed" : "Mark complete"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setActive(null)}>
                    Close
                  </Button>
                </div>
              </div>
              <div className="border-t border-border px-5 pb-4 pt-3">
                <p className="text-xs leading-relaxed text-muted-foreground">{active.summary}</p>
                <a
                  href={`https://www.youtube.com/watch?v=${active.videoId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-[11px] text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  Video not loading? Open it in a new tab
                </a>
              </div>
            </div>

            <div className="mica rounded-2xl p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                <Sparkles className="size-4 text-primary" /> Key ideas
              </h3>
              <ul className="mt-3 space-y-2">
                {active.keyIdeas.map((idea) => (
                  <li key={idea} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    {idea}
                  </li>
                ))}
              </ul>
            </div>

            <QuizCard lecture={active} passed={passedIds.includes(active.id)} />
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {["All", ...DSA_MODULES].map((m) => (
            <button
              key={m}
              onClick={() => setModule(m)}
              className={cn(
                "rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground",
                module === m && "bg-secondary text-foreground",
              )}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((lecture) => {
            const done = watched.includes(lecture.id);
            const quizDone = passedIds.includes(lecture.id);
            return (
              <article key={lecture.id} className="mica flex flex-col rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
                    {lecture.module} · {lecture.level}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {quizDone && <ListChecks className="size-4 text-primary" />}
                    {done && <Check className="size-4 text-success" />}
                  </div>
                </div>
                <h3 className="mt-3 text-sm font-semibold leading-snug tracking-tight">{lecture.title}</h3>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">{lecture.summary}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    {lecture.minutes} min · {lecture.quiz.length} quiz questions
                  </span>
                  <Button
                    size="sm"
                    variant="mica"
                    onClick={() => {
                      setActive(lecture);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    <Play className="mr-1.5 size-3.5" /> Study
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </PageSection>
    </AppShell>
  );
}

function QuizCard({ lecture, passed }: { lecture: DsaLecture; passed: boolean }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ score: number; total: number; passed: boolean; correct: boolean[] } | null>(
    null,
  );
  const submitFn = useServerFn(submitQuiz);
  const qc = useQueryClient();

  const submit = useMutation({
    mutationFn: () =>
      submitFn({
        data: {
          lectureId: lecture.id,
          answers: lecture.quiz.map((q) => answers[q.id] ?? -1).map((v) => (v < 0 ? 99 : v)),
        },
      }),
    onSuccess: (res) => {
      setResult({ score: res.score, total: res.total, passed: res.passed, correct: res.correct });
      qc.invalidateQueries({ queryKey: ["quiz-results"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["achievements"] });
      if (res.reward) {
        toast.success(`+${res.reward.awarded} XP — quiz passed`, {
          description: `${res.reward.xp} XP total · ${res.reward.streak} day streak`,
        });
        celebrateBadges(res.reward.unlocked);
      } else if (!res.passed) {
        toast.error(`${res.score}/${res.total} — review the lecture and try again.`);
      }
    },
    onError: () => toast.error("Could not grade the quiz. Try again."),
  });

  const allAnswered = lecture.quiz.every((q) => answers[q.id] !== undefined);

  return (
    <div className="mica rounded-2xl p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <ListChecks className="size-4 text-primary" /> Comprehension quiz
        </h3>
        {passed && <span className="text-[11px] text-success">Passed</span>}
      </div>

      <div className="mt-4 space-y-5">
        {lecture.quiz.map((q, qi) => (
          <div key={q.id}>
            <p className="text-xs font-medium leading-relaxed">
              {qi + 1}. {q.prompt}
            </p>
            <div className="mt-2 grid gap-2">
              {q.options.map((opt, oi) => {
                const selected = answers[q.id] === oi;
                const verdict = result?.correct[qi];
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={submit.isPending}
                    onClick={() => {
                      setAnswers((a) => ({ ...a, [q.id]: oi }));
                      setResult(null);
                    }}
                    className={cn(
                      "rounded-xl border border-border px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:text-foreground",
                      selected && "bg-secondary text-foreground",
                      selected && result && verdict === true && "border-success text-success",
                      selected && result && verdict === false && "border-destructive text-destructive",
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button
          size="sm"
          variant="hero"
          disabled={!allAnswered || submit.isPending}
          onClick={() => submit.mutate()}
        >
          {submit.isPending ? "Grading…" : "Submit answers"}
        </Button>
        {result && (
          <span className={cn("text-xs", result.passed ? "text-success" : "text-muted-foreground")}>
            {result.score}/{result.total} correct{result.passed ? " — nice work" : " — 2 of 3 needed to pass"}
          </span>
        )}
      </div>
    </div>
  );
}
