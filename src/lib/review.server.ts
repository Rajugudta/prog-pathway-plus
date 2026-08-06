import { streamText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { CHAT_MODEL, createLovableAiGatewayProvider, requireGatewayKey } from "./ai-gateway.server";
import { CODE_REVIEW_SYSTEM_PROMPT } from "./prompts";

export const reviewSchema = z.object({
  verdict: z.string(),
  status: z.enum(["correct-optimal", "correct-slow", "buggy", "incomplete"]),
  yourComplexity: z.object({ time: z.string(), space: z.string() }),
  optimalComplexity: z.object({ time: z.string(), space: z.string() }),
  issues: z.array(z.object({ title: z.string(), detail: z.string(), fix: z.string() })),
  improvements: z.array(z.object({ impact: z.enum(["high", "medium", "low"]), text: z.string() })),
  rewrite: z.string().nullable(),
});

export type SolutionReview = z.infer<typeof reviewSchema>;

export async function reviewCode(input: {
  title: string;
  statement: string;
  difficulty: string;
  topic: string;
  language: string;
  code: string;
}): Promise<SolutionReview> {
  const gateway = createLovableAiGatewayProvider(requireGatewayKey());

  const prompt = [
    `Problem: ${input.title} (${input.difficulty}, ${input.topic})`,
    `Statement: ${input.statement}`,
    `Language: ${input.language}`,
    "",
    "Candidate solution:",
    "```" + input.language.toLowerCase(),
    input.code,
    "```",
    "",
    "Review it. Keep every field short and concrete — no filler. `rewrite` should be a cleaner",
    "idiomatic version in the same language, or null when the code is already optimal and clean.",
    "List at most 4 issues and at most 4 improvements.",
  ].join("\n");

  try {
    const result = streamText({
      model: gateway(CHAT_MODEL),
      system: CODE_REVIEW_SYSTEM_PROMPT,
      prompt,
      output: Output.object({ schema: reviewSchema }),
    });
    return await result.output;
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      return {
        verdict: "I could not parse a structured review this time — try again.",
        status: "incomplete",
        yourComplexity: { time: "unknown", space: "unknown" },
        optimalComplexity: { time: "unknown", space: "unknown" },
        issues: [],
        improvements: [],
        rewrite: null,
      };
    }
    throw error;
  }
}
