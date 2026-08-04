import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type ChatWindowProps = {
  chatId: string;
  initialMessages?: UIMessage[];
  mode: "tutor" | "interview";
  interviewId?: string;
  threadId?: string;
  placeholder?: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyIcon?: React.ReactNode;
  suggestions?: string[];
  onFirstMessage?: (text: string) => void;
  className?: string;
};

export function ChatWindow({
  chatId,
  initialMessages,
  mode,
  interviewId,
  threadId,
  placeholder = "Ask anything — code, concepts, complexity…",
  emptyTitle,
  emptyDescription,
  emptyIcon,
  suggestions = [],
  onFirstMessage,
  className,
}: ChatWindowProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const sentFirst = useRef(false);

  const { messages, sendMessage, status, error } = useChat({
    id: chatId,
    messages: initialMessages ?? [],
    transport: new DefaultChatTransport({
      api: "/api/chat",
      headers: async () => {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
      body: { mode, interviewId, threadId },
    }),
    onError: (err) => {
      toast.error(err.message || "The AI hit a snag. Try again.");
    },
  });

  useEffect(() => {
    textareaRef.current?.focus();
  }, [chatId]);

  useEffect(() => {
    if (status === "ready") textareaRef.current?.focus();
  }, [status]);

  const busy = status === "submitted" || status === "streaming";

  const send = (text: string) => {
    const value = text.trim();
    if (!value || busy) return;
    if (!sentFirst.current && messages.length === 0) {
      sentFirst.current = true;
      onFirstMessage?.(value);
    }
    void sendMessage({ text: value });
  };

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl gap-6">
          {messages.length === 0 ? (
            <ConversationEmptyState
              title={emptyTitle}
              description={emptyDescription}
              icon={emptyIcon}
              className="min-h-[45vh]"
            />
          ) : (
            messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent
                  className={cn(
                    "prose-chat text-[15px]",
                    message.role === "assistant" && "bg-transparent px-0 text-foreground",
                    message.role === "user" && "bg-primary text-primary-foreground",
                  )}
                >
                  {message.parts.map((part, index) =>
                    part.type === "text" ? (
                      <MessageResponse key={`${message.id}-${index}`}>{part.text}</MessageResponse>
                    ) : null,
                  )}
                </MessageContent>
              </Message>
            ))
          )}
          {status === "submitted" && (
            <Shimmer className="text-sm">
              {mode === "interview" ? "The interviewer is thinking…" : "Thinking…"}
            </Shimmer>
          )}
          {error && (
            <p className="text-center text-xs text-destructive">
              {error.message || "Something went wrong."}
            </p>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border bg-background/70 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-3xl px-4 py-4">
          {messages.length === 0 && suggestions.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent/15 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <PromptInput
            onSubmit={(message, event) => {
              event.preventDefault();
              const text = message.text ?? "";
              send(text);
              (event.currentTarget as HTMLFormElement).reset();
            }}
          >
            <PromptInputTextarea ref={textareaRef} placeholder={placeholder} />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} disabled={busy} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
