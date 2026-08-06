import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Search } from "lucide-react";
import { toast } from "sonner";

import { AppShell, PageSection } from "@/components/AppShell";
import { CodeReviewPanel } from "@/components/CodeReviewPanel";
import { celebrateBadges } from "@/lib/celebrate";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LANGUAGES, PROBLEMS, TOPICS, type Problem } from "@/data/problems";
import { getProgress, toggleProblemSolved } from "@/lib/app.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/problems")({
  head: () => ({
    meta: [
      { title: "Problems — CodeDev" },
      { name: "description", content: "500+ curated coding problems from easy to hard with starter code in 12 languages." },
      { property: "og:title", content: "Problems — CodeDev" },
      { property: "og:description", content: "Practice easy to hard problems in Python, Java, C++, Go, Rust and more." },
    ],
  }),
  component: ProblemsPage,
});

const DIFFS = ["All", "Easy", "Medium", "Hard"] as const;

function ProblemsPage() {
  const [difficulty, setDifficulty] = useState<string>("All");
  const [topic, setTopic] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Problem | null>(null);
  const [language, setLanguage] = useState<string>("Python");
  const [limit, setLimit] = useState(60);

  const progressFn = useServerFn(getProgress);
  const toggleFn = useServerFn(toggleProblemSolved);
  const qc = useQueryClient();
  const { data: progress } = useQuery({ queryKey: ["progress"], queryFn: () => progressFn({}) });
  const solved = progress?.solved ?? [];

  const mark = useMutation({
    mutationFn: (vars: { problemId: string; solved: boolean }) => toggleFn({ data: vars }),
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


  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROBLEMS.filter(
      (p) =>
        (difficulty === "All" || p.difficulty === difficulty) &&
        (topic === "All" || p.topic === topic) &&
        (!q || p.title.toLowerCase().includes(q)),
    );
  }, [difficulty, topic, query]);

  return (
    <AppShell
      title="Problem bank"
      subtitle={`${PROBLEMS.length} problems · ${TOPICS.length} topics · ${LANGUAGES.length} languages`}
    >
      <PageSection>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search problems" className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-2">
            {DIFFS.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={cn(
                  "rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground",
                  difficulty === d && "bg-secondary text-foreground",
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {["All", ...TOPICS].map((t) => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              className={cn(
                "rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground hover:text-foreground",
                topic === t && "bg-secondary text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mica mt-6 divide-y divide-border overflow-hidden rounded-2xl">
          {list.slice(0, limit).map((p) => {
            const done = solved.includes(p.slug);
            return (
              <button
                key={p.slug}
                onClick={() => setOpen(p)}
                className="flex w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-secondary/60"
              >
                <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border border-border", done && "border-success text-success")}>
                  {done && <Check className="size-3" />}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">{p.title}</span>
                <span className="hidden text-[11px] text-muted-foreground sm:inline">{p.topic}</span>
                <span
                  className={cn(
                    "w-16 shrink-0 text-right text-[11px]",
                    p.difficulty === "Easy" && "text-success",
                    p.difficulty === "Medium" && "text-warning",
                    p.difficulty === "Hard" && "text-destructive",
                  )}
                >
                  {p.difficulty}
                </span>
              </button>
            );
          })}
        </div>

        {limit < list.length && (
          <div className="mt-4 text-center">
            <Button variant="mica" onClick={() => setLimit((l) => l + 60)}>
              Load more ({list.length - limit} left)
            </Button>
          </div>
        )}

        {open && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm md:items-center md:p-6">
            <div className="mica max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl p-6 md:rounded-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">{open.title}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {open.difficulty} · {open.topic}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setOpen(null)}>
                  Close
                </Button>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{open.statement}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {open.languages.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLanguage(l)}
                    className={cn(
                      "rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground hover:text-foreground",
                      language === l && "bg-secondary text-foreground",
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <CodeReviewPanel key={open.slug} problem={open} language={language} />


              <div className="mt-5 flex justify-end">
                <Button
                  variant={solved.includes(open.slug) ? "secondary" : "hero"}
                  onClick={() => mark.mutate({ problemId: open.slug, solved: !solved.includes(open.slug) })}
                >
                  <Check className="mr-1.5 size-4" />
                  {solved.includes(open.slug) ? "Solved" : "Mark solved"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </PageSection>
    </AppShell>
  );
}
