import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getInterviewById } from "@/data/interviews";
import { CHAT_MODEL, createLovableAiGatewayProvider, requireGatewayKey } from "@/lib/ai-gateway.server";
import { interviewSystemPrompt } from "@/lib/prompts";

const turnSchema = z.object({
  role: z.enum(["interviewer", "candidate"]),
  text: z.string().min(1).max(8000),
});

export type InterviewTurn = z.infer<typeof turnSchema>;

function base64ToBytes(b64: string): Uint8Array {
  const binary = Buffer.from(b64, "base64");
  return new Uint8Array(binary);
}

/** Speech to text for one spoken answer. */
export const transcribeAnswer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        audio: z.string().min(32).max(20_000_000),
        mimeType: z.string().max(120).default("audio/webm"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { transcribeAudio } = await import("./voice.server");
    const text = await transcribeAudio(base64ToBytes(data.audio), data.mimeType);
    return { text };
  });

/** Text to speech for the interviewer's line. Returns base64 mp3. */
export const speakLine = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        text: z.string().min(1).max(4000),
        voice: z.string().min(1).max(40).default("alloy"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { synthesizeSpeech } = await import("./voice.server");
    const audio = await synthesizeSpeech(data.text, data.voice);
    return { audio, mimeType: "audio/mpeg" };
  });

/** One interviewer turn, generated from the running transcript. */
export const interviewReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        interviewId: z.string().min(1).max(80),
        transcript: z.array(turnSchema).max(120),
        secondsLeft: z.number().int().min(0).max(7200),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const interview = getInterviewById(data.interviewId);
    if (!interview) throw new Error("Unknown interview");

    const system = [
      interviewSystemPrompt({
        role: interview.role,
        company: interview.company,
        interviewerName: interview.interviewer,
        persona: interview.persona,
        focus: interview.focus,
        difficulty: interview.difficulty,
        questions: interview.questions,
        durationMinutes: interview.durationMinutes,
      }),
      "",
      "THIS IS A SPOKEN INTERVIEW. Your reply is read aloud by a voice, so:",
      "- Never use markdown, bullet points, code blocks or emoji.",
      "- Speak in short natural sentences, 2-5 of them, like a real person on a call.",
      "- React to what they just said before asking the next thing.",
      `- About ${Math.round(data.secondsLeft / 60)} minutes remain; pace yourself and wrap up cleanly near the end.`,
    ].join("\n");

    const gateway = createLovableAiGatewayProvider(requireGatewayKey());
    const { text } = await generateText({
      model: gateway(CHAT_MODEL),
      system,
      temperature: 0.85,
      messages: data.transcript.map((t) => ({
        role: t.role === "interviewer" ? ("assistant" as const) : ("user" as const),
        content: t.text,
      })),
    });

    return { text: text.trim() };
  });

/** Scores the session, persists it, and awards XP. */
export const finishInterview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        interviewId: z.string().min(1).max(80),
        transcript: z.array(turnSchema).min(2).max(120),
        durationSeconds: z.number().int().min(0).max(14_400),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const interview = getInterviewById(data.interviewId);
    if (!interview) throw new Error("Unknown interview");

    const { gradeInterview } = await import("./voice.server");
    const report = await gradeInterview({
      role: interview.role,
      company: interview.company,
      focus: interview.focus,
      difficulty: interview.difficulty,
      durationSeconds: data.durationSeconds,
      transcript: data.transcript,
    });

    const { error } = await context.supabase.from("interview_sessions").insert({
      user_id: context.userId,
      interview_id: data.interviewId,
      transcript: data.transcript,
      score: Math.round(report.overall),
      feedback: JSON.stringify(report),
      status: "completed",
    });
    if (error) console.error("Failed to store interview session", error.message);

    const { awardXp } = await import("./xp.server");
    const reward = await awardXp(context.supabase, context.userId, 60);

    const { syncAchievements } = await import("./achievements.server");
    let unlocked: string[] = [];
    try {
      const synced = await syncAchievements(context.supabase, context.userId);
      unlocked = synced?.unlocked ?? [];
    } catch (err) {
      console.error("achievement sync failed", err);
    }

    return { report, reward, unlocked };
  });

/** Past sessions for one persona, newest first. */
export const listInterviewSessions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ interviewId: z.string().min(1).max(80) }).parse(input))
  .handler(async ({ context, data }) => {
    const { data: rows, error } = await context.supabase
      .from("interview_sessions")
      .select("id, score, feedback, created_at")
      .eq("user_id", context.userId)
      .eq("interview_id", data.interviewId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(5);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
