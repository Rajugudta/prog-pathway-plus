import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Server-only helper that connects the AI SDK to the Lovable AI Gateway.
 * Never import this from client code.
 */
export function createLovableAiGatewayProvider(
  apiKey: string,
  options?: { structuredOutputs?: boolean },
) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    // Strict json_schema is required for schema-enforced structured output.
    supportsStructuredOutputs: options?.structuredOutputs ?? false,
    headers: { "Lovable-API-Key": apiKey },
  });
}

export function requireGatewayKey(): string {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return key;
}

/** Fast, high quality conversational model used across the app. */
export const CHAT_MODEL = "google/gemini-3.6-flash";
