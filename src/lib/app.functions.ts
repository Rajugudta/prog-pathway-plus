import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

/* ---------------------------------- threads --------------------------------- */

export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("threads")
      .select("id, title, updated_at")
      .eq("user_id", context.userId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ title: z.string().min(1).max(120).optional() }).parse(input ?? {}))
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase
      .from("threads")
      .insert({ user_id: context.userId, title: data.title ?? "New conversation" })
      .select("id, title, updated_at")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const renameThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid(), title: z.string().min(1).max(120) }).parse(input))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("threads")
      .update({ title: data.title })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    await context.supabase.from("messages").delete().eq("thread_id", data.id).eq("user_id", context.userId);
    const { error } = await context.supabase
      .from("threads")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getThreadMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { data: rows, error } = await context.supabase
      .from("messages")
      .select("id, client_id, role, parts, created_at")
      .eq("thread_id", data.id)
      .eq("user_id", context.userId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((row) => ({
      id: (row.client_id as string | null) ?? (row.id as string),
      role: row.role as string,
      parts: (row.parts ?? []) as Json[],
    }));
  });

/* --------------------------------- progress --------------------------------- */

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("id, display_name, xp, level, streak, last_active_day")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return data;
    const { touchStreak } = await import("./xp.server");
    const streak = await touchStreak(context.supabase, context.userId, data as never);
    return { ...data, streak };
  });


export const getProgress = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [problems, lectures] = await Promise.all([
      context.supabase.from("problem_progress").select("problem_id, status").eq("user_id", context.userId),
      context.supabase.from("lecture_progress").select("lecture_id, completed").eq("user_id", context.userId),
    ]);
    return {
      solved: (problems.data ?? []).map((r) => r.problem_id as string),
      watched: (lectures.data ?? []).filter((r) => r.completed).map((r) => r.lecture_id as string),
    };
  });

export const toggleProblemSolved = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ problemId: z.string(), solved: z.boolean() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    if (!data.solved) {
      const { error } = await context.supabase
        .from("problem_progress")
        .delete()
        .eq("user_id", context.userId)
        .eq("problem_id", data.problemId);
      if (error) throw new Error(error.message);
      return { solved: false, reward: null };
    }
    const { error } = await context.supabase
      .from("problem_progress")
      .insert({ user_id: context.userId, problem_id: data.problemId, status: "solved" });
    const alreadySolved = !!error && /duplicate/i.test(error.message);
    if (error && !alreadySolved) throw new Error(error.message);

    if (alreadySolved) return { solved: true, reward: null };
    const { awardXp, XP_PER_PROBLEM } = await import("./xp.server");
    const reward = await awardXp(context.supabase, context.userId, XP_PER_PROBLEM);
    return { solved: true, reward };
  });

export const toggleLectureComplete = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ lectureId: z.string(), completed: z.boolean() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { data: existing } = await context.supabase
      .from("lecture_progress")
      .select("id, completed")
      .eq("user_id", context.userId)
      .eq("lecture_id", data.lectureId)
      .maybeSingle();

    const wasCompleted = !!existing?.completed;

    if (existing) {
      const { error } = await context.supabase
        .from("lecture_progress")
        .update({ completed: data.completed, updated_at: new Date().toISOString() })
        .eq("id", existing.id as string);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase
        .from("lecture_progress")
        .insert({ user_id: context.userId, lecture_id: data.lectureId, completed: data.completed });
      if (error) throw new Error(error.message);
    }

    if (data.completed && !wasCompleted) {
      const { awardXp, XP_PER_LECTURE } = await import("./xp.server");
      const reward = await awardXp(context.supabase, context.userId, XP_PER_LECTURE);
      return { completed: true, reward };
    }
    return { completed: data.completed, reward: null };

  });
