import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { Mic, MessageSquare } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ChatWindow } from "@/components/ChatWindow";
import { VoiceInterviewRoom } from "@/components/VoiceInterviewRoom";
import { getInterviewById } from "@/data/interviews";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/interviews/$interviewId")({
  head: () => ({
    meta: [
      { title: "Mock interview — CodeDev" },
      { name: "description", content: "Run a realistic voice mock interview with a live timer, recording and a scored performance report." },
      { property: "og:title", content: "Mock interview — CodeDev" },
      { property: "og:description", content: "Speak your answers, get interrupted like the real thing, and read an honest debrief." },
    ],
  }),
  component: InterviewRoom,
});

function InterviewRoom() {
  const { interviewId } = useParams({ from: "/_authenticated/interviews/$interviewId" });
  const interview = getInterviewById(interviewId);
  const [mode, setMode] = useState<"voice" | "text">("voice");

  if (!interview) {
    return (
      <AppShell title="Interview not found" subtitle="Pick another persona from the studio">
        <div className="p-8 text-sm text-muted-foreground">This interview doesn't exist.</div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={`${interview.interviewer} · ${interview.company}`}
      subtitle={`${interview.role} — ${interview.focus} · ${interview.durationMinutes} min · ${interview.difficulty}`}
    >
      <div className="flex h-[calc(100vh-4rem)] flex-col">
        <div className="flex items-center gap-2 border-b border-border px-4 py-2">
          {(
            [
              { id: "voice", label: "Voice interview", icon: Mic },
              { id: "text", label: "Type instead", icon: MessageSquare },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground",
                mode === id && "bg-secondary text-foreground",
              )}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>

        {mode === "voice" ? (
          <VoiceInterviewRoom key={interview.id} interview={interview} />
        ) : (
          <ChatWindow
            key={`text-${interview.id}`}
            chatId={`interview-${interview.id}`}
            mode="interview"
            interviewId={interview.id}
            placeholder="Answer as you would in the room…"
            emptyTitle={`${interview.interviewer} is ready when you are`}
            emptyDescription={interview.whatToExpect}
            emptyIcon={<MessageSquare className="size-6" />}
            suggestions={["Hi, I'm ready to start.", "Could you introduce the format first?"]}
          />
        )}
      </div>
    </AppShell>
  );
}
