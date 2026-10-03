import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Download, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { optimizeResume, type OptimizedResume } from "@/lib/resume.functions";
import type { FullProfile } from "@/lib/placement.functions";

type Draft = { summary: string; experience: string; projects: string; education: string; achievements: string };
const EMPTY: Draft = { summary: "", experience: "", projects: "", education: "", achievements: "" };
const KEY = "resume-draft-v1";

const FIELDS: { key: keyof Draft; label: string; hint: string; rows: number }[] = [
  { key: "summary", label: "Summary", hint: "2–3 lines about you and what you want", rows: 3 },
  { key: "experience", label: "Experience / Internships", hint: "One line per point. Start a new item with 'Role, Company — dates'", rows: 5 },
  { key: "projects", label: "Projects", hint: "Name — tech stack, then what it does and the impact", rows: 5 },
  { key: "education", label: "Education", hint: "Degree, college, year, CGPA", rows: 2 },
  { key: "achievements", label: "Achievements & certifications", hint: "Hackathons, coding ranks, certificates", rows: 3 },
];

const lines = (s: string) => s.split("\n").map((l) => l.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);

type Result = OptimizedResume & { companies: string[] };

export function ResumeBuilder({ profile, email }: { profile: FullProfile; email?: string | null }) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [opt, setOpt] = useState<Result | null>(null);
  const optimize = useServerFn(optimizeResume);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setDraft({ ...EMPTY, ...JSON.parse(saved) });
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(draft));
  }, [draft]);

  const mutation = useMutation({
    mutationFn: () =>
      optimize({ data: { ...draft, skills: profile.skills ?? [], targetRole: profile.target_role ?? "" } }),
    onSuccess: (r) => {
      setOpt(r as Result);
      toast.success("Resume tailored to your pipeline");
    },
    onError: (e: Error) => toast.error(e.message || "Could not optimise right now"),
  });

  async function download() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const M = 48;
    let y = M;
    const ensure = (h: number) => {
      if (y + h > H - M) { doc.addPage(); y = M; }
    };
    const text = (t: string, size: number, style: "normal" | "bold" = "normal", indent = 0) => {
      doc.setFont("helvetica", style);
      doc.setFontSize(size);
      const wrapped = doc.splitTextToSize(t, W - M * 2 - indent) as string[];
      for (const w of wrapped) { ensure(size + 4); doc.text(w, M + indent, y); y += size + 4; }
    };
    const section = (title: string) => {
      y += 8; ensure(24);
      doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(20, 60, 140);
      doc.text(title.toUpperCase(), M, y); y += 5;
      doc.setDrawColor(20, 60, 140); doc.setLineWidth(0.8); doc.line(M, y, W - M, y);
      doc.setTextColor(25, 25, 25); y += 13;
    };
    const bullets = (items: string[]) => {
      for (const b of items) {
        const isHead = / — /.test(b) && b.indexOf(" — ") < 60;
        if (isHead) { const [h, ...rest] = b.split(" — "); y += 2; text(h, 10.5, "bold"); if (rest.join(" — ")) text("• " + rest.join(" — "), 10, "normal", 8); }
        else text("• " + b, 10, "normal", 8);
      }
    };

    doc.setTextColor(15, 15, 15);
    text(profile.display_name || "Your Name", 22, "bold");
    const contact = [email, profile.location, profile.linkedin_url, profile.github_url, profile.portfolio_url].filter(Boolean).join("  |  ");
    doc.setTextColor(90, 90, 90);
    if (profile.target_role || profile.headline) text(profile.headline || profile.target_role || "", 11);
    if (contact) text(contact, 9);
    doc.setTextColor(25, 25, 25);

    const summary = opt?.summary || draft.summary;
    if (summary) { section("Summary"); text(summary, 10); }
    const skills = opt?.skills?.length ? opt.skills : profile.skills ?? [];
    if (skills.length) { section("Skills"); text(skills.join(" · "), 10); }
    const exp = opt?.experience?.length ? opt.experience : lines(draft.experience);
    if (exp.length) { section("Experience"); bullets(exp); }
    const proj = opt?.projects?.length ? opt.projects : lines(draft.projects);
    if (proj.length) { section("Projects"); bullets(proj); }
    const edu = lines(draft.education);
    if (edu.length || profile.college) {
      section("Education");
      if (!edu.length) text(`${profile.college}${profile.grad_year ? ` — ${profile.grad_year}` : ""}`, 10);
      edu.forEach((e) => text(e, 10));
    }
    const ach = opt?.achievements?.length ? opt.achievements : lines(draft.achievements);
    if (ach.length) { section("Achievements"); bullets(ach); }

    const name = (profile.display_name || "resume").replace(/\s+/g, "_");
    doc.save(`${name}_Resume.pdf`);
  }

  const filled = Object.values(draft).some((v) => v.trim());

  return (
    <section className="mica rounded-2xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold"><FileText className="size-4 text-primary" /> Resume builder</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Uses your name, links and skills from this page. Your draft is saved on this device.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => mutation.mutate()} disabled={!filled || mutation.isPending}>
            <Sparkles className="size-4" />
            {mutation.isPending ? "Tailoring…" : "Optimise for my pipeline"}
          </Button>
          <Button onClick={download} disabled={!filled && !opt}>
            <Download className="size-4" /> Download PDF
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {FIELDS.map((f) => (
          <label key={f.key} className={f.key === "experience" || f.key === "projects" ? "md:col-span-1" : ""}>
            <span className="text-xs font-medium">{f.label}</span>
            <textarea
              rows={f.rows}
              value={draft[f.key]}
              placeholder={f.hint}
              onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
        ))}
      </div>

      {opt && (
        <div className="mt-5 space-y-4 rounded-xl border border-border bg-background/40 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary">ATS score {Math.round(opt.atsScore)}/100</span>
            <span className="text-xs text-muted-foreground">
              Tailored for {opt.companies.length ? opt.companies.join(", ") : "general SDE roles (add companies in Placement Hub)"}
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold">Optimised summary</p>
            <p className="mt-1 text-sm">{opt.summary}</p>
          </div>
          <div>
            <p className="text-xs font-semibold">Keywords to keep</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {opt.keywords.map((k) => <span key={k} className="rounded-md bg-muted px-2 py-0.5 text-xs">{k}</span>)}
            </div>
          </div>
          {opt.companyTips.length > 0 && (
            <div>
              <p className="text-xs font-semibold">Company-specific tips</p>
              <ul className="mt-1 space-y-1 text-sm">
                {opt.companyTips.map((t) => <li key={t.company}><b>{t.company}:</b> {t.tip}</li>)}
              </ul>
            </div>
          )}
          <p className="text-xs text-muted-foreground">The PDF now uses the optimised version. Replace any “[add metric]” with your real numbers first.</p>
        </div>
      )}
    </section>
  );
}
