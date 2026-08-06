import type { SupabaseClient } from "@supabase/supabase-js";

export const XP_PER_PROBLEM = 25;
export const XP_PER_LECTURE = 15;

export function levelForXp(xp: number) {
  // 100 XP for level 2, then a gently growing curve.
  return Math.max(1, Math.floor(Math.sqrt(Math.max(0, xp) / 100)) + 1);
}

function dayDiff(a: string, b: string) {
  const ms = new Date(`${b}T00:00:00Z`).getTime() - new Date(`${a}T00:00:00Z`).getTime();
  return Math.round(ms / 86_400_000);
}

type ProfileRow = {
  xp: number;
  level: number;
  streak: number;
  last_active_day: string;
};

/**
 * Adds XP, recomputes level, and rolls the daily streak.
 * Returns the resulting profile numbers so the UI can celebrate.
 */
export async function awardXp(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>,
  userId: string,
  amount: number,
) {
  const { data } = await supabase
    .from("profiles")
    .select("xp, level, streak, last_active_day")
    .eq("id", userId)
    .maybeSingle();

  const profile = (data ?? null) as ProfileRow | null;
  if (!profile) return null;

  const today = new Date().toISOString().slice(0, 10);
  const gap = dayDiff(profile.last_active_day, today);
  const streak = gap === 0 ? profile.streak : gap === 1 ? profile.streak + 1 : 1;

  const xp = Math.max(0, profile.xp + amount);
  const level = levelForXp(xp);
  const leveledUp = level > profile.level;

  await supabase
    .from("profiles")
    .update({ xp, level, streak, last_active_day: today })
    .eq("id", userId);

  return { xp, level, streak, leveledUp, awarded: amount };
}

/** Keeps the streak honest when the user simply opens the app. */
export async function touchStreak(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>,
  userId: string,
  profile: ProfileRow,
) {
  const today = new Date().toISOString().slice(0, 10);
  const gap = dayDiff(profile.last_active_day, today);
  if (gap === 0) return profile.streak;
  const streak = gap === 1 ? profile.streak : 1;
  await supabase.from("profiles").update({ streak, last_active_day: today }).eq("id", userId);
  return streak;
}
