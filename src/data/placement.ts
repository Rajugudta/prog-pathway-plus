export type ResumeRule = { label: string; bad: string; good: string };

export const RESUME_RULES: ResumeRule[] = [
  {
    label: "Quantify the impact",
    bad: "Worked on the backend of a college project.",
    good: "Cut API p95 latency from 820ms to 190ms by adding Redis caching and fixing 6 N+1 queries.",
  },
  {
    label: "Lead with the verb, end with the metric",
    bad: "Was responsible for the frontend UI.",
    good: "Rebuilt the checkout UI in React, lifting mobile conversion 14% across 3k weekly sessions.",
  },
  {
    label: "Name the stack, not the buzzwords",
    bad: "Used latest cutting-edge technologies.",
    good: "Built with TypeScript, PostgreSQL and Docker; deployed on Fly.io with GitHub Actions CI.",
  },
  {
    label: "One page, no filler",
    bad: "Objective: Seeking a challenging role in a reputed organisation.",
    good: "Delete the objective. Use that space for a third project bullet with numbers.",
  },
];

export type AptitudeTopic = { topic: string; weight: string; drills: string[] };

export const APTITUDE_TOPICS: AptitudeTopic[] = [
  { topic: "Quantitative", weight: "35% of most tests", drills: ["Percentages & profit-loss", "Time, speed, distance", "Time & work", "Ratios and averages", "Permutations, combinations, probability"] },
  { topic: "Logical Reasoning", weight: "30%", drills: ["Number & letter series", "Blood relations", "Seating arrangements", "Syllogisms", "Data sufficiency"] },
  { topic: "Verbal", weight: "20%", drills: ["Reading comprehension under time", "Error spotting", "Sentence completion", "Para jumbles"] },
  { topic: "Technical MCQ", weight: "15%", drills: ["Output prediction in C/Java", "Complexity of given code", "SQL query results", "OS & DBMS one-liners"] },
];

export type HrQuestion = { q: string; framework: string; trap: string };

export const HR_QUESTIONS: HrQuestion[] = [
  {
    q: "Tell me about yourself.",
    framework: "90 seconds: present role/degree → two proof points with numbers → why this role, now.",
    trap: "Reciting your résumé chronologically from class 10.",
  },
  {
    q: "Tell me about a time you failed.",
    framework: "STAR, but spend 60% on what you changed afterwards and the measurable result of that change.",
    trap: "A humblebrag failure like 'I work too hard'. Interviewers stop listening.",
  },
  {
    q: "Why do you want to join us?",
    framework: "One specific product/engineering detail you researched + how your work connects to it.",
    trap: "'Good work culture and growth opportunities' — true of every company, so it says nothing.",
  },
  {
    q: "Describe a conflict with a teammate.",
    framework: "Situation, your first assumption, what you did to check it, the resolution, the relationship after.",
    trap: "Making the teammate the villain. They're hiring for how you handle people.",
  },
  {
    q: "What are your salary expectations?",
    framework: "Ask for their range first. If pressed, give a researched band and say you're flexible on the mix.",
    trap: "Naming a number before you know the band. You anchor yourself down.",
  },
  {
    q: "Where do you see yourself in five years?",
    framework: "Skill trajectory, not job titles: 'owning a service end to end, mentoring juniors'.",
    trap: "'In your chair' or 'doing an MBA' — both read as flight risk.",
  },
];

export type SalaryTip = { title: string; detail: string };

export const NEGOTIATION_TIPS: SalaryTip[] = [
  { title: "Know CTC vs in-hand", detail: "CTC includes employer PF, gratuity and variable pay. Compute monthly in-hand before you compare two offers." },
  { title: "Never counter on the call", detail: "Thank them, ask for the written offer, and reply within 48 hours with one considered counter." },
  { title: "Counter with evidence", detail: "Cite a competing offer, a market band, or a scope difference. Never 'I need more'." },
  { title: "Negotiate the whole package", detail: "Joining bonus, relocation, location, band and start date are often more flexible than base." },
  { title: "Get it in writing", detail: "Verbal promises about band or role change do not survive team transfers." },
];

export type CompanyBar = { company: string; rounds: string; bar: string };

export const HIRING_BARS: CompanyBar[] = [
  { company: "Product (FAANG-style)", rounds: "OA → 2–3 DSA → design → hiring manager", bar: "Two clean mediums in 45 minutes with clear narration. Communication is scored." },
  { company: "Fintech / Trading", rounds: "OA → DSA → CS core → culture", bar: "Speed and precision. Edge cases and numeric correctness matter more than elegance." },
  { company: "Product startups", rounds: "Screen → practical build → founder round", bar: "Shipping evidence. A live project you can defend beats a perfect DP answer." },
  { company: "Service companies", rounds: "Aptitude → technical → HR", bar: "Aptitude cutoffs are strict. CS core one-liners and confident communication carry the technical round." },
];
