import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { COMPANIES } from "@/data/companies";

const resumeSchema = z.object({
  summary: z.string().max(1200),
  experience: z.string().max(4000),
  projects: z.string().max(4000),
  education: z.string().max(1500),
  achievements: z.string().max(2000),
  skills: z.array(z.string().max(40)).max(40),
  targetRole: z.string().max(80),
});

export const optimizedSchema = z.object({
  summary: z.string(),
  experience: z.array(z.string()),
  projects: z.array(z.string()),
  achievements: z.array(z.string()),
  skills: z.array(z.string()),
  keywords: z.array(z.string()),
  atsScore: z.number(),
  companyTips: z.array(z.object({ company: z.string(), tip: z.string() })),
});
export type OptimizedResume = z.infer<typeof optimizedSchema>;

export const optimizeResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => resumeSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { data: apps } = await context.supabase
      .from("company_applications")
      .select("company_id, status")
      .eq("user_id", context.userId)
      .neq("status", "rejected");
    const pipeline = (apps ?? [])
      .map((a) => COMPANIES.find((c) => c.id === a.company_id))
      .filter((c): c is (typeof COMPANIES)[number] => !!c);

    const { streamText, Output } = await import("ai");
    const { CHAT_MODEL, createLovableAiGatewayProvider, requireGatewayKey } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(requireGatewayKey(), { structuredOutputs: true });

    const companyBlock = pipeline.length
      ? pipeline.map((c) => `- ${c.name}: roles ${c.roles.join(", ")}; focus ${c.focus.join(", ")}; rounds ${c.rounds.join(" → ")}`).join("\n")
      : "- (no companies in pipeline — optimise for general SDE roles at Indian product companies)";

    const result = streamText({
      model: gateway(CHAT_MODEL),
      system:
        "You are a senior tech recruiter and ATS expert. Rewrite student resumes into crisp, truthful, one-page content. Never invent employers, numbers or facts that are not implied by the input; you may sharpen wording and suggest where a metric belongs using [add metric]. Bullets start with strong action verbs, max ~25 words each.",
      prompt: [
        `Target role: ${data.targetRole || "Software Engineer"}`,
        `Companies in pipeline:\n${companyBlock}`,
        "",
        `Summary:\n${data.summary}`,
        `Experience:\n${data.experience}`,
        `Projects:\n${data.projects}`,
        `Education:\n${data.education}`,
        `Achievements:\n${data.achievements}`,
        `Skills: ${data.skills.join(", ")}`,
        "",
        "Return: a 2–3 sentence summary tailored to these companies; experience and project bullets (one string per bullet, keep a 'Title — ' prefix on the first bullet of each item when the input has one); achievement bullets; a reordered skills list (most relevant first, add only obviously implied ones); 8–15 ATS keywords from the companies' focus areas; an atsScore 0–100 for the optimised version; one concrete tip per pipeline company.",
      ].join("\n"),
      output: Output.object({ schema: optimizedSchema }),
    });
    const out = await result.output;
    return { ...out, companies: pipeline.map((c) => c.name) };
  });
