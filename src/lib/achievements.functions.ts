import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Json } from "@/integrations/supabase/types";
import type { SolutionReview } from "./review.server";


/* ------------------------------- achievements ------------------------------ */

export const getAchievements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { buildStats } = await import("./achievements.server");
    const [stats, rows] = await Promise.all([
      buildStats(context.supabase, context.userId),
      context.supabase.from("achievements").select("badge_id, unlocked_at").eq("user_id", context.userId),
    ]);
    return {
      stats,
      unlocked: (rows.data ?? []).map((r) => ({
        badgeId: r.badge_id as string,
        unlockedAt: r.unlocked_at as string,
      })),
    };
  });

/** Re-checks every badge rule; safe to call at any time. */
export const refreshAchievements = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { syncAchievements } = await import("./achievements.server");
    const { unlocked } = await syncAchievements(context.supabase, context.userId);
    return { unlocked };
  });

/* ------------------------------ code review ------------------------------- */

const reviewInput = z.object({
  problemId: z.string(),
  title: z.string(),
  statement: z.string(),
  difficulty: z.string(),
  topic: z.string(),
  language: z.string(),
  code: z.string().min(10).max(20000),
});

export const reviewSolution = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => reviewInput.parse(input))
  .handler(async ({ context, data }) => {
    const { reviewCode } = await import("./review.server");
    const review = await reviewCode(data);

    await context.supabase.from("solution_reviews").upsert(
      {
        user_id: context.userId,
        problem_id: data.problemId,
        language: data.language,
        code: data.code,
        review: review as unknown as Json,
      },
      { onConflict: "user_id,problem_id" },
    );

    return review;
  });

export const getSolution = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ problemId: z.string() }).parse(input))
  .handler(async ({ context, data }) => {
    const { data: row } = await context.supabase
      .from("solution_reviews")
      .select("language, code, review, updated_at")
      .eq("user_id", context.userId)
      .eq("problem_id", data.problemId)
      .maybeSingle();
    if (!row) return null;
    return {
      language: row.language as string,
      code: row.code as string,
      review: row.review as unknown as SolutionReview,
      updatedAt: row.updated_at as string,
    };
  });

export const saveSolution = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ problemId: z.string(), language: z.string(), code: z.string().max(20000) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { data: existing } = await context.supabase
      .from("problem_progress")
      .select("id")
      .eq("user_id", context.userId)
      .eq("problem_id", data.problemId)
      .maybeSingle();

    // Never downgrade a "solved" row — only store the code the learner is working on.
    const { error } = existing
      ? await context.supabase
          .from("problem_progress")
          .update({ language: data.language, code: data.code })
          .eq("id", existing.id as string)
      : await context.supabase.from("problem_progress").insert({
          user_id: context.userId,
          problem_id: data.problemId,
          status: "attempted",
          language: data.language,
          code: data.code,
        });
    if (error) throw new Error(error.message);

    return { ok: true };
  });
