import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Lock, Trophy } from "lucide-react";

import { AppShell, PageSection } from "@/components/AppShell";
import { BADGES, FAMILY_LABEL, TIER_STYLE, type BadgeFamily } from "@/data/achievements";
import { getAchievements } from "@/lib/achievements.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements — CodeDev" },
      { name: "description", content: "Unlock badges for XP milestones, daily streaks, topic mastery and mock interviews." },
      { property: "og:title", content: "Achievements — CodeDev" },
      { property: "og:description", content: "Track your badges across XP, streaks, problems solved and topic mastery." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AchievementsPage,
});

function AchievementsPage() {
  const fn = useServerFn(getAchievements);
  const { data } = useQuery({ queryKey: ["achievements"], queryFn: () => fn({}) });

  const stats = data?.stats;
  const unlockedAt = new Map((data?.unlocked ?? []).map((u) => [u.badgeId, u.unlockedAt]));
  const families = [...new Set(BADGES.map((b) => b.family))] as BadgeFamily[];
  const earned = BADGES.filter((b) => stats && b.progress(stats) >= b.goal).length;

  return (
    <AppShell title="Achievements" subtitle={`${earned} of ${BADGES.length} badges unlocked`}>
      <PageSection>
        {families.map((family) => (
          <div key={family} className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {FAMILY_LABEL[family]}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {BADGES.filter((b) => b.family === family).map((badge) => {
                const progress = stats ? badge.progress(stats) : 0;
                const done = progress >= badge.goal;
                const tier = TIER_STYLE[badge.tier];
                const pct = Math.min(100, Math.round((progress / badge.goal) * 100));
                return (
                  <div
                    key={badge.id}
                    className={cn(
                      "mica rounded-xl p-4 ring-1 transition",
                      done ? tier.ring : "ring-transparent opacity-70",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("rounded-lg bg-secondary p-2", done ? tier.text : "text-muted-foreground")}>
                        {done ? <Trophy className="size-4" /> : <Lock className="size-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{badge.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{badge.description}</p>
                      </div>
                      <span className={cn("text-[10px] uppercase tracking-wide", tier.text)}>{tier.label}</span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                      {done
                        ? `Unlocked${unlockedAt.get(badge.id) ? ` · ${new Date(unlockedAt.get(badge.id)!).toLocaleDateString()}` : ""}`
                        : `${Math.min(progress, badge.goal)} / ${badge.goal}`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </PageSection>
    </AppShell>
  );
}
