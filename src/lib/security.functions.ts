import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const settingsSchema = z.object({
  auto_logout_minutes: z.number().int().min(0).max(480).optional(),
  remember_me: z.boolean().optional(),
  profile_visibility: z.enum(["private", "recruiters", "public"]).optional(),
  show_on_leaderboard: z.boolean().optional(),
  email_notifications: z.boolean().optional(),
  interview_reminders: z.boolean().optional(),
  share_analytics: z.boolean().optional(),
});

export type UserSettings = {
  auto_logout_minutes: number;
  remember_me: boolean;
  profile_visibility: string;
  show_on_leaderboard: boolean;
  email_notifications: boolean;
  interview_reminders: boolean;
  share_analytics: boolean;
};

const DEFAULTS: UserSettings = {
  auto_logout_minutes: 30,
  remember_me: true,
  profile_visibility: "private",
  show_on_leaderboard: true,
  email_notifications: true,
  interview_reminders: true,
  share_analytics: false,
};

const SETTINGS_COLUMNS =
  "auto_logout_minutes, remember_me, profile_visibility, show_on_leaderboard, email_notifications, interview_reminders, share_analytics";

export const getSecurityOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [settingsRes, rolesRes, historyRes] = await Promise.all([
      context.supabase.from("user_settings").select(SETTINGS_COLUMNS).eq("user_id", context.userId).maybeSingle(),
      context.supabase.from("user_roles").select("role").eq("user_id", context.userId),
      context.supabase
        .from("login_history")
        .select("id, device, browser, platform, method, created_at")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false })
        .limit(25),
    ]);

    let settings = (settingsRes.data as UserSettings | null) ?? null;
    if (!settings) {
      const { data } = await context.supabase
        .from("user_settings")
        .insert({ user_id: context.userId })
        .select(SETTINGS_COLUMNS)
        .maybeSingle();
      settings = (data as UserSettings | null) ?? DEFAULTS;
    }

    return {
      settings,
      roles: (rolesRes.data ?? []).map((r) => r.role as string),
      history: historyRes.data ?? [],
    };
  });

export const updateSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => settingsSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase
      .from("user_settings")
      .upsert({ user_id: context.userId, ...data }, { onConflict: "user_id" })
      .select(SETTINGS_COLUMNS)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row as UserSettings | null) ?? DEFAULTS;
  });

export const recordLogin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        device: z.string().max(80).default("Unknown device"),
        browser: z.string().max(80).default("Unknown browser"),
        platform: z.string().max(80).default("Unknown"),
        method: z.string().max(40).default("password"),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ context, data }) => {
    const { data: recent } = await context.supabase
      .from("login_history")
      .select("id, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Debounce: one entry per session start, not per page load.
    if (recent?.created_at && Date.now() - new Date(recent.created_at as string).getTime() < 30 * 60 * 1000) {
      return { ok: true, recorded: false };
    }

    await context.supabase.from("login_history").insert({ user_id: context.userId, ...data });
    return { ok: true, recorded: true };
  });

export const clearLoginHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase.from("login_history").delete().eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
