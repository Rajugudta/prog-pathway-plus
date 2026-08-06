import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Play, Search } from "lucide-react";
import { toast } from "sonner";

import { AppShell, PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LECTURES, LECTURE_TRACKS, type Lecture } from "@/data/lectures";
import { getProgress, toggleLectureComplete } from "@/lib/app.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/learn")({
  head: () => ({
    meta: [
      { title: "Lectures — CodeDev" },
      {
        name: "description",
        content: "Watch curated programming lectures inside the app: Python, DSA, web, systems and AI tracks with tracked progress.",
      },
      { property: "og:title", content: "Lectures — CodeDev" },
      { property: "og:description", content: "Every lecture plays in-app, with your progress saved." },
    ],
  }),
  component: LearnPage,
});

function LearnPage() {
  const [track, setTrack] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Lecture | null>(null);

  const progressFn = useServerFn(getProgress);
  const toggleFn = useServerFn(toggleLectureComplete);
  const qc = useQueryClient();

  const { data: progress } = useQuery({ queryKey: ["progress"], queryFn: () => progressFn({}) });
  const watched = progress?.watched ?? [];

  const mark = useMutation({
    mutationFn: (vars: { lectureId: string; completed: boolean }) => toggleFn({ data: vars }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["progress"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      if (res?.reward) {
        toast.success(`+${res.reward.awarded} XP`, {
          description: res.reward.leveledUp
            ? `Level ${res.reward.level} unlocked · ${res.reward.streak} day streak`
            : `${res.reward.xp} XP total · ${res.reward.streak} day streak`,
        });
      }
    },
  });


  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LECTURES.filter(
      (l) =>
        (track === "All" || l.track === track) &&
        (!q || l.title.toLowerCase().includes(q) || l.summary.toLowerCase().includes(q)),
    );
  }, [track, query]);

  return (
    <AppShell title="Lectures" subtitle={`${LECTURES.length} deep-dives — all playing inside the app`}>
      <PageSection>
        {active && (
          <div className="mica mb-6 overflow-hidden rounded-2xl">
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
                  {active.author} · {active.level} · {active.minutes} min
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
          </div>
        )}

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search lectures"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {["All", ...LECTURE_TRACKS].map((t) => (
              <button
                key={t}
                onClick={() => setTrack(t)}
                className={cn(
                  "rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground",
                  track === t && "bg-secondary text-foreground",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((lecture) => {
            const done = watched.includes(lecture.id);
            return (
              <article key={lecture.id} className="mica flex flex-col rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
                    {lecture.track} · {lecture.level}
                  </span>
                  {done && <Check className="size-4 text-success" />}
                </div>
                <h3 className="mt-3 text-sm font-semibold leading-snug tracking-tight">{lecture.title}</h3>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">{lecture.summary}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    {lecture.author} · {lecture.minutes} min
                  </span>
                  <Button
                    size="sm"
                    variant="mica"
                    onClick={() => {
                      setActive(lecture);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    <Play className="mr-1.5 size-3.5" /> Watch
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
