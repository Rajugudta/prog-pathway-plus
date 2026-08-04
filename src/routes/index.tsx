import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Braces,
  BookOpen,
  GraduationCap,
  Map as MapIcon,
  MessagesSquare,
  Mic,
  Sparkle,
} from "lucide-react";
import { PROBLEM_COUNT } from "@/data/problems";
import { LECTURES } from "@/data/lectures";
import { MOCK_INTERVIEWS } from "@/data/interviews";
import { ROADMAPS } from "@/data/roadmaps";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CodeDev — Learn to Code, Then Get Hired" },
      {
        name: "description",
        content:
          "In-app lectures, 500+ curated problems in 12 languages, an AI tutor that talks like a human, 15 mock interviews and a placement hub built for engineering students.",
      },
      { property: "og:title", content: "CodeDev — Learn to Code, Then Get Hired" },
      {
        property: "og:description",
        content:
          "Lectures, 500+ problems, an AI tutor, human-feeling mock interviews and placement prep in one studio.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: BookOpen,
    title: "Lectures that play in-app",
    body: `${LECTURES.length} curated deep-dives across Python, DSA, web, systems and AI — embedded players, tracked progress, zero tab-hopping.`,
  },
  {
    icon: Braces,
    title: `${PROBLEM_COUNT}+ problems, 12 languages`,
    body: "Easy to hard, grouped by topic, with starter templates in Python, Java, C, C++, JS, TS, Go, C#, Rust, Kotlin, Swift and SQL.",
  },
  {
    icon: MessagesSquare,
    title: "An AI tutor with a personality",
    body: "Aria explains like a senior engineer who actually enjoys teaching — intuition first, complexity always, threads saved to your account.",
  },
  {
    icon: Mic,
    title: `${MOCK_INTERVIEWS.length} human mock interviews`,
    body: "Real personas that probe, push back and go quiet — then hand you an honest hiring-manager debrief with a score.",
  },
  {
    icon: MapIcon,
    title: `${ROADMAPS.length} beginner→advanced roadmaps`,
    body: "Weekly milestones, hour budgets, checkpoints and a shipped project at the end of every phase.",
  },
  {
    icon: GraduationCap,
    title: "A placement hub with teeth",
    body: "ATS-safe resume rewrites, aptitude drills, HR frameworks, company hiring bars and salary negotiation scripts.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-gradient-primary text-sm font-bold text-primary-foreground">
              {"</>"}
            </div>
            <span className="text-sm font-semibold tracking-tight">CodeDev</span>
          </div>
          <Button asChild size="sm">
            <Link to="/auth">Start free</Link>
          </Button>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 -top-40 h-[420px] bg-gradient-primary opacity-20 blur-[120px]" />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-20 md:px-8 md:pb-24 md:pt-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground">
            <Sparkle className="size-3.5 text-accent" />
            Built for placement season
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
            Learn to code properly.
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Then walk into the interview calm.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            One studio for the whole journey: lectures you never leave the app for, {PROBLEM_COUNT}+
            problems from easy to hard, an AI tutor that talks like a person, and mock interviews
            that feel uncomfortably real.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="xl">
              <Link to="/auth">
                Create your account <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild variant="mica" size="xl">
              <Link to="/auth">I already have one</Link>
            </Button>
          </div>

          <dl className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              [`${PROBLEM_COUNT}+`, "curated problems"],
              [`${LECTURES.length}`, "in-app lectures"],
              [`${MOCK_INTERVIEWS.length}`, "mock interviews"],
              [`${ROADMAPS.length}`, "guided roadmaps"],
            ].map(([value, label]) => (
              <div key={label} className="mica rounded-2xl p-5">
                <dt className="text-2xl font-bold tracking-tight">{value}</dt>
                <dd className="mt-1 text-xs text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-24 md:px-8">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Everything, in one place</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          No stitching together six tabs and a spreadsheet. The whole prep loop lives here.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <article key={f.title} className="mica group rounded-2xl p-6 transition-transform hover:-translate-y-1">
              <div className="grid size-10 place-items-center rounded-xl bg-secondary text-accent">
                <f.icon className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-xs text-muted-foreground md:px-8">
          <span>© {new Date().getFullYear()} CodeDev</span>
          <Link to="/auth" className="hover:text-foreground">
            Get started →
          </Link>
        </div>
      </footer>
    </div>
  );
}
