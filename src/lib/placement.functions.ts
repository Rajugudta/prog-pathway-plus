import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const STATUSES = ["bookmarked", "applied", "online_test", "interviewing", "offer", "rejected"] as const;

const APP_COLUMNS = "id, company_id, status, applied_on, next_step_on, notes, updated_at";

export type CompanyApplication = {
  id: string;
  company_id: string;
  status: string;
  applied_on: string | null;
  next_step_on: string | null;
  notes: string | null;
  updated_at: string;
};

export const listApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("company_applications")
      .select(APP_COLUMNS)
      .eq("user_id", context.userId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as CompanyApplication[];
  });

export const upsertApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        companyId: z.string().min(1).max(80),
        status: z.enum(STATUSES),
        appliedOn: z.string().max(20).nullable().optional(),
        nextStepOn: z.string().max(20).nullable().optional(),
        notes: z.string().max(2000).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const payload: Record<string, unknown> = {
      user_id: context.userId,
      company_id: data.companyId,
      status: data.status,
    };
    if (data.appliedOn !== undefined) payload["applied_on"] = data.appliedOn || null;
    if (data.nextStepOn !== undefined) payload["next_step_on"] = data.nextStepOn || null;
    if (data.notes !== undefined) payload["notes"] = data.notes || null;

    const { data: row, error } = await context.supabase
      .from("company_applications")
      .upsert(payload as never, { onConflict: "user_id,company_id" })
      .select(APP_COLUMNS)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row as CompanyApplication | null;
  });

export const removeApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ companyId: z.string().min(1).max(80) }).parse(input))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("company_applications")
      .delete()
      .eq("user_id", context.userId)
      .eq("company_id", data.companyId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------------------------- profile ---------------------------------- */

const PROFILE_COLUMNS =
  "id, display_name, avatar_url, headline, college, grad_year, target_role, location, skills, github_url, linkedin_url, portfolio_url, xp, level, streak";

export type FullProfile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  headline: string | null;
  college: string | null;
  grad_year: number | null;
  target_role: string | null;
  location: string | null;
  skills: string[];
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  xp: number;
  level: number;
  streak: number;
};

export const getFullProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as FullProfile | null) ?? null;
  });

const urlish = z.string().trim().max(200).nullable().optional();

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        display_name: z.string().trim().min(1).max(60).optional(),
        headline: z.string().trim().max(120).nullable().optional(),
        college: z.string().trim().max(120).nullable().optional(),
        grad_year: z.number().int().min(1990).max(2040).nullable().optional(),
        target_role: z.string().trim().max(80).nullable().optional(),
        location: z.string().trim().max(80).nullable().optional(),
        skills: z.array(z.string().trim().min(1).max(30)).max(30).optional(),
        github_url: urlish,
        linkedin_url: urlish,
        portfolio_url: urlish,
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const patch = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
    const { data: row, error } = await context.supabase
      .from("profiles")
      .update(patch as never)
      .eq("id", context.userId)
      .select(PROFILE_COLUMNS)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row as FullProfile | null;
  });
