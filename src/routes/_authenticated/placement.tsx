import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Bookmark,
  BookmarkCheck,
  Building2,
  CalendarClock,
  Filter,
  Search,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { AppShell, PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SkeletonGrid } from "@/components/states";
import { cn } from "@/lib/utils";
import {
  APPLICATION_STATUSES,
  CATEGORIES,
  COMPANIES,
  STATUS_LABEL,
  type ApplicationStatus,
  type Company,
} from "@/data/companies";
import { APTITUDE_TOPICS, HIRING_BARS, HR_QUESTIONS, NEGOTIATION_TIPS, RESUME_RULES } from "@/data/placement";
import {
  listApplications,
  removeApplication,
  upsertApplication,
  type CompanyApplication,
} from "@/lib/placement.functions";

export const Route = createFileRoute("/_authenticated/placement")({
  head: () => ({
    meta: [
      { title: "Placement Hub — CodeDev" },
      {
        name: "description",
        content:
          "Track company applications end to end, study real hiring bars, and rehearse resume, aptitude, HR and salary negotiation with concrete scripts.",
      },
      { property: "og:title", content: "Placement Hub — CodeDev" },
      {
        property: "og:description",
        content: "Everything between your last practice problem and a signed offer, in one tracked pipeline.",
      },
    ],
  }),
  component: PlacementPage,
});

const STATUS_STYLE: Record<ApplicationStatus, string> = {
  bookmarked: "border-border bg-secondary text-muted-foreground",
  applied: "border-primary/30 bg-primary/10 text-primary",
  online_test: "border-warning/30 bg-warning/10 text-warning",
  interviewing: "border-warning/40 bg-warning/15 text-warning",
  offer: "border-success/30 bg-success/10 text-success",
  rejected: "border-destructive/30 bg-destructive/10 text-destructive",
};

const DIFFICULTY_STYLE: Record<Company["difficulty"], string> = {
  Moderate: "text-success",
  Hard: "text-warning",
  "Very hard": "text-destructive",
};

function PlacementPage() {
  const queryClient = useQueryClient();
  const fetchApps = useServerFn(listApplications);
  const saveApp = useServerFn(upsertApplication);
  const dropApp = useServerFn(removeApplication);

  const apps = useQuery({ queryKey: ["applications"], queryFn: () => fetchApps() });

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [open, setOpen] = useState<Company | null>(null);

  const byId = useMemo(() => {
    const map = new Map<string, CompanyApplication>();
    for (const a of apps.data ?? []) map.set(a.company_id, a);
    return map;
  }, [apps.data]);

  const save = useMutation({
    mutationFn: (input: {
      companyId: string;
      status: ApplicationStatus;
      appliedOn?: string | null;
      nextStepOn?: string | null;
      notes?: string | null;
    }) => saveApp({ data: input }),
    onSuccess: (_r, v) => {
      void queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success(`Saved — ${STATUS_LABEL[v.status]}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (companyId: string) => dropApp({ data: { companyId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Removed from your pipeline");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COMPANIES.filter((c) => {
      if (category !== "all" && c.category !== category) return false;
      if (statusFilter !== "all") {
        const st = byId.get(c.id)?.status;
        if (statusFilter === "untracked" ? !!st : st !== statusFilter) return false;
      }
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.roles.join(" ").toLowerCase().includes(q) ||
        c.focus.join(" ").toLowerCase().includes(q)
      );
    });
  }, [query, category, statusFilter, byId]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { tracked: byId.size };
    for (const s of APPLICATION_STATUSES) c[s] = 0;
    for (const a of apps.data ?? []) c[a.status] = (c[a.status] ?? 0) + 1;
    return c;
  }, [apps.data, byId]);

  const upcoming = useMemo(
    () =>
      (apps.data ?? [])
        .filter((a) => a.next_step_on)
        .sort((x, y) => (x.next_step_on! < y.next_step_on! ? -1 : 1))
        .slice(0, 4),
    [apps.data],
  );

  return (
    <AppShell
      title="Placement Hub"
      subtitle="A tracked pipeline, real hiring bars, and the prep that closes the gap"
    >
      <PageSection className="space-y-8">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Building2} label="Companies tracked" value={counts["tracked"] ?? 0} hint={`${COMPANIES.length} in catalogue`} />
          <StatCard icon={TrendingUp} label="In interview loop" value={counts["interviewing"] ?? 0} hint="Active conversations" />
          <StatCard icon={BookmarkCheck} label="Offers" value={counts["offer"] ?? 0} hint="Signed or in hand" />
          <StatCard
            icon={CalendarClock}
            label="Next step"
            value={upcoming[0]?.next_step_on ? formatDate(upcoming[0].next_step_on) : "—"}
            hint={upcoming[0] ? companyName(upcoming[0].company_id) : "Nothing scheduled"}
            small
          />
        </section>

        <Tabs defaultValue="companies">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="pipeline">My pipeline</TabsTrigger>
            <TabsTrigger value="resume">Resume</TabsTrigger>
            <TabsTrigger value="aptitude">Aptitude</TabsTrigger>
            <TabsTrigger value="hr">HR round</TabsTrigger>
            <TabsTrigger value="offer">Offer &amp; salary</TabsTrigger>
          </TabsList>

          {/* ------------------------------ companies ------------------------------ */}
          <TabsContent value="companies" className="mt-6 space-y-4">
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search company, role or focus area"
                  className="pl-9"
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="sm:w-[170px]">
                  <Filter className="size-3.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sectors</SelectItem>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="sm:w-[170px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any status</SelectItem>
                  <SelectItem value="untracked">Not tracked</SelectItem>
                  {APPLICATION_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {apps.isLoading ? (
              <SkeletonGrid />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((c) => {
                  const app = byId.get(c.id);
                  return (
                    <article key={c.id} className="mica flex flex-col rounded-2xl p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{c.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {c.category} · {c.tier}
                          </p>
                        </div>
                        <button
                          aria-label={app ? `Remove ${c.name}` : `Bookmark ${c.name}`}
                          onClick={() =>
                            app
                              ? remove.mutate(c.id)
                              : save.mutate({ companyId: c.id, status: "bookmarked" })
                          }
                          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          {app ? <BookmarkCheck className="size-4 text-primary" /> : <Bookmark className="size-4" />}
                        </button>
                      </div>

                      <p className="mt-3 text-sm font-medium text-foreground">{c.ctc}</p>
                      <p className="text-[11px] text-muted-foreground">{c.roles.join(" · ")}</p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {c.focus.slice(0, 3).map((f) => (
                          <span key={f} className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                            {f}
                          </span>
                        ))}
                      </div>

                      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{c.prepNote}</p>

                      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
                        <span className={cn("text-[11px] font-medium", DIFFICULTY_STYLE[c.difficulty])}>
                          {c.difficulty}
                        </span>
                        {app && (
                          <span className={cn("rounded-full border px-2 py-0.5 text-[10px]", STATUS_STYLE[app.status as ApplicationStatus])}>
                            {STATUS_LABEL[app.status as ApplicationStatus]}
                          </span>
                        )}
                        <Button size="sm" variant="secondary" onClick={() => setOpen(c)}>
                          Details
                        </Button>
                      </div>
                    </article>
                  );
                })}
                {filtered.length === 0 && (
                  <p className="mica rounded-2xl p-8 text-center text-sm text-muted-foreground md:col-span-2 xl:col-span-3">
                    No company matches those filters.
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          {/* ------------------------------- pipeline ------------------------------- */}
          <TabsContent value="pipeline" className="mt-6">
            {(apps.data ?? []).length === 0 ? (
              <p className="mica rounded-2xl p-8 text-center text-sm text-muted-foreground">
                Nothing tracked yet. Bookmark a company from the Companies tab and it appears here with its stage,
                dates and notes.
              </p>
            ) : (
              <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <div className="mica divide-y divide-border rounded-2xl">
                  {(apps.data ?? []).map((a) => (
                    <div key={a.id} className="flex flex-wrap items-center gap-3 p-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{companyName(a.company_id)}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {a.applied_on ? `Applied ${formatDate(a.applied_on)}` : "Not applied yet"}
                          {a.next_step_on ? ` · Next ${formatDate(a.next_step_on)}` : ""}
                        </p>
                      </div>
                      <Select
                        value={a.status}
                        onValueChange={(v) =>
                          save.mutate({ companyId: a.company_id, status: v as ApplicationStatus })
                        }
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {APPLICATION_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {STATUS_LABEL[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <button
                        aria-label={`Remove ${companyName(a.company_id)}`}
                        onClick={() => remove.mutate(a.company_id)}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="mica rounded-2xl p-5">
                    <p className="text-sm font-semibold">Stage breakdown</p>
                    <div className="mt-3 space-y-2">
                      {APPLICATION_STATUSES.map((s) => (
                        <div key={s} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{STATUS_LABEL[s]}</span>
                          <span className="font-medium">{counts[s] ?? 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mica rounded-2xl p-5">
                    <p className="text-sm font-semibold">Upcoming steps</p>
                    {upcoming.length === 0 ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Add a next-step date from a company's detail view to see your calendar here.
                      </p>
                    ) : (
                      <ul className="mt-3 space-y-2 text-xs">
                        {upcoming.map((u) => (
                          <li key={u.id} className="flex justify-between gap-3">
                            <span className="truncate text-muted-foreground">{companyName(u.company_id)}</span>
                            <span className="shrink-0 font-medium">{formatDate(u.next_step_on!)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* -------------------------------- resume -------------------------------- */}
          <TabsContent value="resume" className="mt-6 grid gap-4 md:grid-cols-2">
            {RESUME_RULES.map((r) => (
              <article key={r.label} className="mica rounded-2xl p-5">
                <p className="text-sm font-medium">{r.label}</p>
                <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-muted-foreground">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-destructive">Weak</span>
                  {r.bad}
                </p>
                <p className="mt-2 rounded-lg border border-success/30 bg-success/10 p-3 text-xs text-foreground">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-success">Strong</span>
                  {r.good}
                </p>
              </article>
            ))}
          </TabsContent>

          {/* ------------------------------- aptitude ------------------------------- */}
          <TabsContent value="aptitude" className="mt-6 space-y-4">
            <div className="mica divide-y divide-border rounded-2xl">
              {APTITUDE_TOPICS.map((t) => (
                <div key={t.topic} className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{t.topic}</p>
                    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                      {t.weight}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {t.drills.map((d) => (
                      <span key={d} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ---------------------------------- HR ---------------------------------- */}
          <TabsContent value="hr" className="mt-6 grid gap-4 md:grid-cols-2">
            {HR_QUESTIONS.map((q) => (
              <article key={q.q} className="mica rounded-2xl p-5">
                <p className="text-sm font-medium">{q.q}</p>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  <span className="font-medium text-foreground">Framework — </span>
                  {q.framework}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  <span className="font-medium text-warning">Trap — </span>
                  {q.trap}
                </p>
              </article>
            ))}
          </TabsContent>

          {/* --------------------------------- offer --------------------------------- */}
          <TabsContent value="offer" className="mt-6 grid gap-4 lg:grid-cols-2">
            <div>
              <h2 className="text-base font-semibold tracking-tight">Company hiring bars</h2>
              <div className="mica mt-4 divide-y divide-border rounded-2xl">
                {HIRING_BARS.map((c) => (
                  <div key={c.company} className="p-5">
                    <p className="text-sm font-medium">{c.company}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{c.rounds}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{c.bar}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight">Negotiation scripts</h2>
              <div className="mt-4 space-y-3">
                {NEGOTIATION_TIPS.map((t) => (
                  <article key={t.title} className="mica rounded-2xl p-5">
                    <p className="text-sm font-medium">{t.title}</p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t.detail}</p>
                  </article>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </PageSection>

      <CompanyDialog
        company={open}
        application={open ? byId.get(open.id) : undefined}
        onClose={() => setOpen(null)}
        onSave={(v) => save.mutate(v)}
      />
    </AppShell>
  );
}

function CompanyDialog({
  company,
  application,
  onClose,
  onSave,
}: {
  company: Company | null;
  application: CompanyApplication | undefined;
  onClose: () => void;
  onSave: (v: {
    companyId: string;
    status: ApplicationStatus;
    appliedOn?: string | null;
    nextStepOn?: string | null;
    notes?: string | null;
  }) => void;
}) {
  const [status, setStatus] = useState<ApplicationStatus>("bookmarked");
  const [appliedOn, setAppliedOn] = useState("");
  const [nextStepOn, setNextStepOn] = useState("");
  const [notes, setNotes] = useState("");
  const [hydrated, setHydrated] = useState<string | null>(null);

  if (company && hydrated !== company.id) {
    setHydrated(company.id);
    setStatus((application?.status as ApplicationStatus) ?? "bookmarked");
    setAppliedOn(application?.applied_on ?? "");
    setNextStepOn(application?.next_step_on ?? "");
    setNotes(application?.notes ?? "");
  }

  return (
    <Dialog open={!!company} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        {company && (
          <>
            <DialogHeader>
              <DialogTitle>{company.name}</DialogTitle>
              <DialogDescription>
                {company.category} · {company.tier} · {company.ctc}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <Detail label="Eligibility" value={company.eligibility} />
                <Detail label="Hiring window" value={company.hiringWindow} />
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Interview rounds</p>
                <ol className="mt-2 space-y-1.5">
                  {company.rounds.map((r, i) => (
                    <li key={r} className="flex gap-3 text-xs">
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-secondary text-[10px] font-medium">
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground">{r}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">What they actually test</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {company.focus.map((f) => (
                    <span key={f} className="rounded-full bg-secondary px-2.5 py-1 text-[11px]">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <p className="rounded-lg border border-primary/25 bg-primary/5 p-3 text-xs leading-relaxed">
                {company.prepNote}
              </p>

              <div className="space-y-3 border-t border-border pt-4">
                <p className="text-sm font-semibold">Track your application</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="space-y-1.5 text-[11px] text-muted-foreground">
                    Stage
                    <Select value={status} onValueChange={(v) => setStatus(v as ApplicationStatus)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {APPLICATION_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {STATUS_LABEL[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>
                  <label className="space-y-1.5 text-[11px] text-muted-foreground">
                    Applied on
                    <Input type="date" value={appliedOn} onChange={(e) => setAppliedOn(e.target.value)} />
                  </label>
                  <label className="space-y-1.5 text-[11px] text-muted-foreground">
                    Next step
                    <Input type="date" value={nextStepOn} onChange={(e) => setNextStepOn(e.target.value)} />
                  </label>
                </div>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Referral contact, recruiter name, what went well in round 1…"
                  rows={3}
                />
                <Button
                  onClick={() => {
                    onSave({
                      companyId: company.id,
                      status,
                      appliedOn: appliedOn || null,
                      nextStepOn: nextStepOn || null,
                      notes: notes || null,
                    });
                    onClose();
                  }}
                >
                  Save to pipeline
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-xs">{value}</p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  small,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  hint: string;
  small?: boolean;
}) {
  return (
    <div className="mica rounded-2xl p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className={cn("mt-2 font-semibold tracking-tight", small ? "text-lg" : "text-2xl")}>{value}</p>
      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function companyName(id: string) {
  return COMPANIES.find((c) => c.id === id)?.name ?? id;
}

function formatDate(d: string) {
  return new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}
