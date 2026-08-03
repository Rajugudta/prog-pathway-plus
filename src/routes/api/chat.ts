import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import { createLovableAiGatewayProvider, requireGatewayKey, CHAT_MODEL } from "@/lib/ai-gateway.server";
import { TUTOR_SYSTEM_PROMPT, interviewSystemPrompt } from "@/lib/prompts";
import { getInterviewById } from "@/data/interviews";

type ChatRequestBody = {
  messages?: UIMessage[];
  threadId?: string;
  mode?: "tutor" | "interview";
  interviewId?: string;
};

function userClient(token: string) {
  return createClient(process.env["SUPABASE_URL"]!, process.env["SUPABASE_PUBLISHABLE_KEY"]!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatRequestBody;
        const messages = body.messages;
        if (!Array.isArray(messages) || messages.length === 0) {
          return new Response("Messages are required", { status: 400 });
        }

        const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
        if (!token) return new Response("Unauthorized", { status: 401 });

        const supabase = userClient(token);
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) return new Response("Unauthorized", { status: 401 });
        const userId = userData.user.id;

        let system = TUTOR_SYSTEM_PROMPT;
        if (body.mode === "interview") {
          const interview = getInterviewById(body.interviewId ?? "");
          if (!interview) return new Response("Unknown interview", { status: 400 });
          system = interviewSystemPrompt({
            role: interview.role,
            company: interview.company,
            interviewerName: interview.interviewer,
            persona: interview.persona,
            focus: interview.focus,
            difficulty: interview.difficulty,
            questions: interview.questions,
            durationMinutes: interview.durationMinutes,
          });
        }

        // Tutor threads are persisted; verify ownership before writing anything.
        let threadId: string | null = null;
        if (body.mode !== "interview" && body.threadId) {
          const { data: thread } = await supabase
            .from("threads")
            .select("id")
            .eq("id", body.threadId)
            .eq("user_id", userId)
            .maybeSingle();
          if (!thread) return new Response("Thread not found", { status: 404 });
          threadId = thread.id as string;
        }

        const gateway = createLovableAiGatewayProvider(requireGatewayKey());

        let result;
        try {
          result = streamText({
            model: gateway(CHAT_MODEL),
            system,
            messages: convertToModelMessages(messages),
            temperature: 0.85,
          });
        } catch (error) {
          console.error("streamText failed", error);
          return new Response("AI request failed", { status: 500 });
        }

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          onFinish: async ({ responseMessage }) => {
            if (!threadId) return;
            const last = messages[messages.length - 1];
            const rows: Array<Record<string, unknown>> = [];
            if (last && last.role === "user") {
              rows.push({
                thread_id: threadId,
                user_id: userId,
                client_id: last.id,
                role: "user",
                parts: last.parts,
              });
            }
            rows.push({
              thread_id: threadId,
              user_id: userId,
              client_id: responseMessage.id,
              role: "assistant",
              parts: responseMessage.parts,
            });
            const { error: insertError } = await supabase.from("messages").insert(rows);
            if (insertError) console.error("Failed to persist messages", insertError);
            const { error: touchError } = await supabase
              .from("threads")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", threadId);
            if (touchError) console.error("Failed to touch thread", touchError);
          },
          onError: (error) => {
            console.error("Chat stream error", error);
            return "The tutor hit a snag. Try again in a moment.";
          },
        });
      },
    },
  },
});
