import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { UIMessage } from "ai";
import { MessagesSquare } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ChatWindow } from "@/components/ChatWindow";
import { getThreadMessages } from "@/lib/app.functions";

export const Route = createFileRoute("/_authenticated/tutor/$threadId")({
  head: () => ({
    meta: [
      { title: "Tutor conversation — CodeDev" },
      { name: "description", content: "Your saved AI tutoring conversation on CodeDev." },
      { property: "og:title", content: "Tutor conversation — CodeDev" },
      { property: "og:description", content: "Continue where you left off with Aria." },
    ],
  }),
  component: TutorThread,
});

function TutorThread() {
  const { threadId } = useParams({ from: "/_authenticated/tutor/$threadId" });
  const messagesFn = useServerFn(getThreadMessages);
  const { data, isLoading } = useQuery({
    queryKey: ["thread-messages", threadId],
    queryFn: () => messagesFn({ data: { id: threadId } }),
  });

  return (
    <AppShell title="Aria — AI Tutor" subtitle="Intuition first, then the code, always the complexity">
      <div className="flex h-[calc(100vh-4rem)] flex-col">
        {!isLoading && (
          <ChatWindow
            key={threadId}
            chatId={threadId}
            threadId={threadId}
            mode="tutor"
            initialMessages={(data ?? []) as unknown as UIMessage[]}
            emptyTitle="What are we untangling today?"
            emptyDescription="Paste code, describe a bug, or ask for the mental model behind a concept."
            emptyIcon={<MessagesSquare className="size-6" />}
            suggestions={[
              "Explain dynamic programming like I've never seen it",
              "Why is my binary search off by one?",
              "Design a URL shortener at 10k RPS",
            ]}
          />
        )}
      </div>
    </AppShell>
  );
}
