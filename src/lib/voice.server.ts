import { streamText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { CHAT_MODEL, createLovableAiGatewayProvider, requireGatewayKey } from "./ai-gateway.server";

const GATEWAY = "https://ai.gateway.lovable.dev/v1";

export const STT_MODEL = "openai/gpt-4o-mini-transcribe";
export const TTS_MODEL = "openai/gpt-4o-mini-tts";

function gatewayError(status: number, body: string): Error {
  if (status === 429) return new Error("The voice service is busy right now. Wait a few seconds and speak again.");
  if (status === 402) return new Error("AI credits are exhausted for this workspace. Add credits to keep practising.");
  if (status === 403) return new Error("AI access is blocked for this workspace.");
  console.error(`AI gateway audio failed [${status}]: ${body}`);
  return new Error(`Voice service error (${status}).`);
}

/** Turns a recorded answer into text. */
export async function transcribeAudio(bytes: Uint8Array, mimeType: string): Promise<string> {
  const form = new FormData();
  const ext = mimeType.includes("mp4") ? "mp4" : mimeType.includes("ogg") ? "ogg" : "webm";
  form.append("file", new Blob([bytes as unknown as BlobPart], { type: mimeType }), `answer.${ext}`);
  form.append("model", STT_MODEL);

  const res = await fetch(`${GATEWAY}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${requireGatewayKey()}` },
    body: form,
  });
  if (!res.ok) throw gatewayError(res.status, await res.text());
  const json = (await res.json()) as { text?: string };
  return (json.text ?? "").trim();
}

/** Speaks the interviewer's line. Returns base64 mp3. */
export async function synthesizeSpeech(text: string, voice: string): Promise<string> {
  const res = await fetch(`${GATEWAY}/audio/speech`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requireGatewayKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: TTS_MODEL, voice, input: text, response_format: "mp3" }),
  });
  if (!res.ok) throw gatewayError(res.status, await res.text());
  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}

export const reportSchema = z.object({
  overall: z.number().min(0).max(100),
  verdict: z.string(),
  recommendation: z.enum(["strong-hire", "hire", "borderline", "no-hire"]),
  scores: z.object({
    communication: z.number().min(0).max(10),
    problemSolving: z.number().min(0).max(10),
    technicalDepth: z.number().min(0).max(10),
    structure: z.number().min(0).max(10),
    confidence: z.number().min(0).max(10),
  }),
  strengths: z.array(z.string()).max(5),
  improvements: z.array(z.object({ title: z.string(), detail: z.string() })).max(5),
  missedPoints: z.array(z.string()).max(5),
  betterAnswer: z.string(),
  nextSteps: z.array(z.string()).max(4),
});

export type InterviewReport = z.infer<typeof reportSchema>;

const REPORT_SYSTEM = [
  "You are a hiring manager writing the debrief after a live voice interview.",
  "Be honest and specific — quote what the candidate actually said. No flattery, no filler.",
  "This was spoken aloud, so ignore grammar slips and filler words unless they hurt clarity.",
  "Score strictly: 5/10 is an average candidate, 8+ is genuinely strong.",
].join(" ");

export async function gradeInterview(input: {
  role: string;
  company: string;
  focus: string;
  difficulty: string;
  durationSeconds: number;
  transcript: { role: "interviewer" | "candidate"; text: string }[];
}): Promise<InterviewReport> {
  const gateway = createLovableAiGatewayProvider(requireGatewayKey());
  const minutes = Math.max(1, Math.round(input.durationSeconds / 60));

  const prompt = [
    `Role: ${input.role} at ${input.company}`,
    `Focus: ${input.focus} · Difficulty: ${input.difficulty} · Length: ${minutes} min`,
    "",
    "Transcript:",
    ...input.transcript.map((m) => `${m.role === "interviewer" ? "Interviewer" : "Candidate"}: ${m.text}`),
    "",
    "Write the debrief. `betterAnswer` = a model answer (6-10 sentences) for the weakest question,",
    "written in a natural spoken voice the candidate could actually say out loud.",
  ].join("\n");

  try {
    const result = streamText({
      model: gateway(CHAT_MODEL),
      system: REPORT_SYSTEM,
      prompt,
      output: Output.object({ schema: reportSchema }),
    });
    return await result.output;
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      throw new Error("Could not score this session — try ending the interview again.");
    }
    throw error;
  }
}
