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
          <div className="fixed inset-0 z-50 flex flex-col bg-background">
            <div className="flex items-center gap-3 border-b border-border px-4 py-2.5">
              <Button variant="ghost" size="sm" onClick={() => setOpen(null)}>
                ← Problem list
              </Button>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{open.title}</span>
              <Button
                size="sm"
                variant={solved.includes(open.slug) ? "secondary" : "hero"}
                disabled={mark.isPending}
                onClick={() => mark.mutate({ problemId: open.slug, solved: !solved.includes(open.slug) })}
              >
                <Check className="mr-1.5 size-4" />
                {solved.includes(open.slug) ? "Solved" : "Submit as solved"}
              </Button>
            </div>
            <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-2 lg:overflow-hidden">
              <ProblemDescription problem={open} solved={solved.includes(open.slug)} />
              <div className="flex min-h-0 flex-col border-t border-border lg:border-l lg:border-t-0">
                <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2">
                  <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Code</span>
                  <select
                    value={open.languages.includes(language) ? language : open.languages[0]}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="rounded-md border border-border bg-secondary px-2 py-1 text-xs"
                  >
                    {open.languages.map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
                  <CodeReviewPanel
                    key={`${open.slug}-${language}`}
                    problem={open}
                    language={open.languages.includes(language) ? language : (open.languages[0] ?? language)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </PageSection>
    </AppShell>
  );
}

const TOPIC_HINTS: Record<string, string[]> = {
  Arrays: ["Can a hash map remember what you've already seen?", "Try two pointers or a prefix sum before nested loops."],
  Strings: ["Count characters with a fixed-size array or map.", "A sliding window often replaces re-scanning substrings."],
  "Linked List": ["Draw the pointers before you move them.", "Fast and slow pointers find middles and cycles."],
  Trees: ["Decide what each recursive call should return to its parent.", "BFS with a queue handles level-by-level questions."],
  Graphs: ["Build an adjacency list first.", "Track visited nodes to avoid infinite loops."],
  "Dynamic Programming": ["Define dp[i] in one sentence before coding.", "Write the brute-force recursion, then memoise it."],
};

function ProblemDescription({ problem, solved }: { problem: Problem; solved: boolean }) {
  const [tab, setTab] = useState<"description" | "hints">("description");
  const hints = TOPIC_HINTS[problem.topic] ?? [
    "Start with the brute force and state its complexity.",
    "Ask what repeated work you can cache or skip.",
  ];
  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex gap-1 border-b border-border px-4 py-2">
        {(["description", "hints"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-md px-3 py-1 text-xs capitalize text-muted-foreground hover:text-foreground",
              tab === t && "bg-secondary text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {tab === "description" ? (
          <>
            <h2 className="text-xl font-semibold tracking-tight">{problem.title}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
              <span
                className={cn(
                  "rounded-full bg-secondary px-2.5 py-1",
                  problem.difficulty === "Easy" && "text-success",
                  problem.difficulty === "Medium" && "text-warning",
                  problem.difficulty === "Hard" && "text-destructive",
                )}
              >
                {problem.difficulty}
              </span>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-muted-foreground">{problem.topic}</span>
              {solved && <span className="rounded-full bg-secondary px-2.5 py-1 text-success">✓ Solved</span>}
            </div>
            <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-foreground/90">{problem.statement}</p>
            <h3 className="mt-6 text-sm font-semibold">Approach checklist</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <li>• Restate the input and output in your own words.</li>
              <li>• Test edge cases: empty input, one element, duplicates, negatives.</li>
              <li>• State time and space complexity before you submit.</li>
            </ul>
            <p className="mt-6 rounded-xl border border-border bg-secondary/50 p-4 text-xs text-muted-foreground">
              Write your solution on the right, then press <span className="text-foreground">Review my code</span> — the
              AI checks correctness, complexity and edge cases like a judge would.
            </p>
          </>
        ) : (
          <ol className="space-y-3">
            {hints.map((h, i) => (
              <li key={h}>
                <details className="rounded-xl border border-border p-4">
                  <summary className="cursor-pointer text-sm font-medium">Hint {i + 1}</summary>
                  <p className="mt-2 text-sm text-muted-foreground">{h}</p>
                </details>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
