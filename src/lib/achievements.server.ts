import type { SupabaseClient } from "@supabase/supabase-js";
import { PROBLEMS } from "@/data/problems";
import { earnedBadgeIds, type LearnerStats } from "@/data/achievements";

const PROBLEM_BY_SLUG = new Map(PROBLEMS.map((p) => [p.slug, p]));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = SupabaseClient<any, any, any>;

export async function buildStats(supabase: Client, userId: string): Promise<LearnerStats> {
  const [profile, problems, lectures, interviews] = await Promise.all([
    supabase.from("profiles").select("xp, level, streak").eq("id", userId).maybeSingle(),
    supabase.from("problem_progress").select("problem_id").eq("user_id", userId),
    supabase.from("lecture_progress").select("lecture_id").eq("user_id", userId).eq("completed", true),
    supabase.from("interview_sessions").select("id").eq("user_id", userId).eq("status", "completed"),
  ]);

  const stats: LearnerStats = {
    xp: (profile.data?.xp as number) ?? 0,
    level: (profile.data?.level as number) ?? 1,
    streak: (profile.data?.streak as number) ?? 0,
    solvedTotal: 0,
    solvedEasy: 0,
    solvedMedium: 0,
    solvedHard: 0,
    solvedByTopic: {},
    lectures: lectures.data?.length ?? 0,
    interviews: interviews.data?.length ?? 0,
  };

  for (const row of problems.data ?? []) {
    const problem = PROBLEM_BY_SLUG.get(row.problem_id as string);
    stats.solvedTotal += 1;
    if (!problem) continue;
    if (problem.difficulty === "Easy") stats.solvedEasy += 1;
    else if (problem.difficulty === "Medium") stats.solvedMedium += 1;
    else stats.solvedHard += 1;
    stats.solvedByTopic[problem.topic] = (stats.solvedByTopic[problem.topic] ?? 0) + 1;
  }

  return stats;
}

/**
 * Compares earned badges against what is already stored and inserts the new ones.
 * Returns the badge ids unlocked by this call so the UI can celebrate them.
 */
export async function syncAchievements(supabase: Client, userId: string, stats?: LearnerStats) {
  const resolved = stats ?? (await buildStats(supabase, userId));
  const earned = earnedBadgeIds(resolved);
  if (earned.length === 0) return { stats: resolved, unlocked: [] as string[] };

  const { data: existing } = await supabase
    .from("achievements")
    .select("badge_id")
    .eq("user_id", userId);

  const have = new Set((existing ?? []).map((r) => r.badge_id as string));
  const fresh = earned.filter((id) => !have.has(id));
  if (fresh.length === 0) return { stats: resolved, unlocked: [] as string[] };

  await supabase
    .from("achievements")
    .insert(fresh.map((badge_id) => ({ user_id: userId, badge_id })));

  return { stats: resolved, unlocked: fresh };
}
