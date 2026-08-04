import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { MessagesSquare, Plus, Trash2 } from "lucide-react";
import { AppShell, PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { createThread, deleteThread, listThreads } from "@/lib/app.functions";

export const Route = createFileRoute("/_authenticated/tutor/")({
  head: () => ({
    meta: [
      { title: "AI Tutor — CodeDev" },
      { name: "description", content: "Chat with Aria, an AI tutor that explains code and algorithms like a senior engineer. Every conversation is saved." },
      { property: "og:title", content: "AI Tutor — CodeDev" },
      { property: "og:description", content: "Threaded AI tutoring for code, DSA and system design." },
    ],
  }),
  component: TutorIndex,
});

function TutorIndex() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const listFn = useServerFn(listThreads);
  const createFn = useServerFn(createThread);
  const deleteFn = useServerFn(deleteThread);

  const { data: threads } = useQuery({ queryKey: ["threads"], queryFn: () => listFn({}) });

  const create = useMutation({
    mutationFn: () => createFn({ data: {} }),
    onSuccess: (thread) => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      if (thread) navigate({ to: "/tutor/$threadId", params: { threadId: thread.id as string } });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["threads"] }),
  });

  return (
    <AppShell
      title="AI Tutor"
      subtitle="Aria remembers each conversation — start one per topic"
      actions={
        <Button size="sm" variant="hero" onClick={() => create.mutate()} disabled={create.isPending}>
          <Plus className="mr-1.5 size-4" /> New conversation
        </Button>
      }
    >
      <PageSection>
        {threads && threads.length > 0 ? (
          <div className="mica divide-y divide-border overflow-hidden rounded-2xl">
            {threads.map((t) => (
              <div key={t.id as string} className="flex items-center gap-3 px-5 py-3">
                <button
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  onClick={() => navigate({ to: "/tutor/$threadId", params: { threadId: t.id as string } })}
                >
                  <MessagesSquare className="size-4 shrink-0 text-accent" />
                  <span className="min-w-0 flex-1 truncate text-sm">{t.title as string}</span>
                  <span className="hidden text-[11px] text-muted-foreground sm:inline">
                    {new Date(t.updated_at as string).toLocaleDateString()}
                  </span>
                </button>
                <button
                  className="text-muted-foreground transition-colors hover:text-destructive"
                  onClick={() => remove.mutate(t.id as string)}
                  aria-label="Delete conversation"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mica rounded-2xl p-10 text-center">
            <h2 className="text-base font-semibold tracking-tight">No conversations yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Ask about a failing test case, a complexity you can't shake, or how a hash map actually
              works under the hood.
            </p>
            <Button className="mt-5" variant="hero" onClick={() => create.mutate()}>
              <Plus className="mr-1.5 size-4" /> Start your first thread
            </Button>
          </div>
        )}
      </PageSection>
    </AppShell>
  );
}
