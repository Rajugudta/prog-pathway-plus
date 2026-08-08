import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getQuizResults = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("quiz_results")
      .select("lecture_id, score, total, passed")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const submitQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        lectureId: z.string().min(1).max(64),
        answers: z.array(z.number().int().min(0).max(9)).min(1).max(20),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { QUIZ_ANSWERS, QUIZ_PASS_RATIO } = await import("./quiz-answers.server");
    const key = QUIZ_ANSWERS[data.lectureId];
    if (!key) throw new Error("Unknown quiz");

    // Grading happens here only — the client never receives the answer key.
    const correct = key.map((expected, i) => data.answers[i] === expected);
    const score = correct.filter(Boolean).length;
    const total = key.length;
    const passed = score / total >= QUIZ_PASS_RATIO;

    const { data: existing } = await context.supabase
      .from("quiz_results")
      .select("id, passed, score")
      .eq("user_id", context.userId)
      .eq("lecture_id", data.lectureId)
      .maybeSingle();

    const wasPassed = !!existing?.passed;

    if (existing) {
      const bestScore = Math.max(score, (existing.score as number) ?? 0);
      const { error } = await context.supabase
        .from("quiz_results")
        .update({ score: bestScore, total, passed: wasPassed || passed })
        .eq("id", existing.id as string);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase
        .from("quiz_results")
        .insert({ user_id: context.userId, lecture_id: data.lectureId, score, total, passed });
      if (error) throw new Error(error.message);
    }

    let reward = null as null | Record<string, unknown>;
    if (passed && !wasPassed) {
      const { awardXp } = await import("./xp.server");
      const { syncAchievements } = await import("./achievements.server");
      const r = await awardXp(context.supabase, context.userId, 20);
      const { unlocked } = await syncAchievements(context.supabase, context.userId);
      reward = r ? { ...r, unlocked } : null;
    }

    return { score, total, passed, correct, reward };
  });
