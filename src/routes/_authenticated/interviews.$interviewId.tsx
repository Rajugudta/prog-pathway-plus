import { createFileRoute, useParams } from "@tanstack/react-router";
import { Mic } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ChatWindow } from "@/components/ChatWindow";
import { getInterviewById } from "@/data/interviews";

export const Route = createFileRoute("/_authenticated/interviews/$interviewId")({
  head: () => ({
    meta: [
      { title: "Mock interview — CodeDev" },
      { name: "description", content: "Run a realistic mock interview with an AI interviewer and get a scored debrief." },
      { property: "og:title", content: "Mock interview — CodeDev" },
      { property: "og:description", content: "One question at a time, real follow-ups, honest scoring." },
    ],
  }),
  component: InterviewRoom,
});

function InterviewRoom() {
  const { interviewId } = useParams({ from: "/_authenticated/interviews/$interviewId" });
  const interview = getInterviewById(interviewId);

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
        <ChatWindow
          key={interview.id}
          chatId={`interview-${interview.id}`}
          mode="interview"
          interviewId={interview.id}
          placeholder="Answer out loud, as you would in the room…"
          emptyTitle={`${interview.interviewer} is ready when you are`}
          emptyDescription={interview.whatToExpect}
          emptyIcon={<Mic className="size-6" />}
          suggestions={["Hi, I'm ready to start.", "Could you introduce the format first?"]}
        />
      </div>
    </AppShell>
  );
}
