export type BadgeTier = "bronze" | "silver" | "gold" | "platinum";

export type BadgeFamily = "xp" | "streak" | "problems" | "difficulty" | "topic" | "learning";

export type LearnerStats = {
  xp: number;
  level: number;
  streak: number;
  solvedTotal: number;
  solvedEasy: number;
  solvedMedium: number;
  solvedHard: number;
  solvedByTopic: Record<string, number>;
  lectures: number;
  interviews: number;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  tier: BadgeTier;
  family: BadgeFamily;
  /** Progress target used for the "3 / 10" bar. */
  goal: number;
  /** Current progress for a learner. */
  progress: (s: LearnerStats) => number;
};

const num = (n: number) => (Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0);

function threshold(
  id: string,
  name: string,
  description: string,
  tier: BadgeTier,
  family: BadgeFamily,
  goal: number,
  pick: (s: LearnerStats) => number,
): Badge {
  return { id, name, description, tier, family, goal, progress: (s) => num(pick(s)) };
}

const topicBadge = (id: string, name: string, topic: string, goal: number, tier: BadgeTier): Badge =>
  threshold(id, name, `Solve ${goal} problems in ${topic}.`, tier, "topic", goal, (s) => s.solvedByTopic[topic] ?? 0);

export const BADGES: Badge[] = [
  /* ------------------------------- XP & level ------------------------------- */
  threshold("xp-25", "First Steps", "Earn your first 25 XP.", "bronze", "xp", 25, (s) => s.xp),
  threshold("xp-250", "Warming Up", "Reach 250 XP.", "bronze", "xp", 250, (s) => s.xp),
  threshold("xp-500", "Grinder", "Reach 500 XP.", "silver", "xp", 500, (s) => s.xp),
  threshold("xp-2000", "Machine", "Reach 2,000 XP.", "gold", "xp", 2000, (s) => s.xp),
  threshold("xp-10000", "Legend", "Reach 10,000 XP.", "platinum", "xp", 10000, (s) => s.xp),
  threshold("level-5", "Level 5", "Climb to level 5.", "silver", "xp", 5, (s) => s.level),
  threshold("level-10", "Level 10", "Climb to level 10.", "gold", "xp", 10, (s) => s.level),

  /* --------------------------------- Streaks -------------------------------- */
  threshold("streak-3", "Three in a Row", "Practise 3 days in a row.", "bronze", "streak", 3, (s) => s.streak),
  threshold("streak-7", "Week Warrior", "Keep a 7 day streak.", "silver", "streak", 7, (s) => s.streak),
  threshold("streak-14", "Fortnight Focus", "Keep a 14 day streak.", "silver", "streak", 14, (s) => s.streak),
  threshold("streak-30", "Monthly Machine", "Keep a 30 day streak.", "gold", "streak", 30, (s) => s.streak),
  threshold("streak-100", "Unbreakable", "Keep a 100 day streak.", "platinum", "streak", 100, (s) => s.streak),

  /* -------------------------------- Problems -------------------------------- */
  threshold("solved-1", "Hello, Solved", "Solve your first problem.", "bronze", "problems", 1, (s) => s.solvedTotal),
  threshold("solved-10", "Getting Reps", "Solve 10 problems.", "bronze", "problems", 10, (s) => s.solvedTotal),
  threshold("solved-50", "Half Century", "Solve 50 problems.", "silver", "problems", 50, (s) => s.solvedTotal),
  threshold("solved-100", "Century", "Solve 100 problems.", "gold", "problems", 100, (s) => s.solvedTotal),
  threshold("solved-250", "Double Down", "Solve 250 problems.", "gold", "problems", 250, (s) => s.solvedTotal),
  threshold("solved-500", "The Whole Bank", "Solve 500 problems.", "platinum", "problems", 500, (s) => s.solvedTotal),

  /* ------------------------------- Difficulty ------------------------------- */
  threshold("easy-25", "Easy Does It", "Solve 25 Easy problems.", "bronze", "difficulty", 25, (s) => s.solvedEasy),
  threshold("medium-25", "Middle Ground", "Solve 25 Medium problems.", "silver", "difficulty", 25, (s) => s.solvedMedium),
  threshold("medium-100", "Interview Ready", "Solve 100 Medium problems.", "gold", "difficulty", 100, (s) => s.solvedMedium),
  threshold("hard-10", "Into the Deep", "Solve 10 Hard problems.", "gold", "difficulty", 10, (s) => s.solvedHard),
  threshold("hard-50", "Hard Mode", "Solve 50 Hard problems.", "platinum", "difficulty", 50, (s) => s.solvedHard),

  /* ---------------------------- Topic mastery ------------------------------- */
  topicBadge("topic-arrays", "Array Artisan", "Arrays & Strings", 20, "silver"),
  topicBadge("topic-hashing", "Hash Hero", "Hashing & Sets", 12, "bronze"),
  topicBadge("topic-pointers", "Pointer Pro", "Two Pointers & Sliding Window", 12, "silver"),
  topicBadge("topic-trees", "Tree Whisperer", "Trees & BST", 20, "silver"),
  topicBadge("topic-graphs", "Graph Navigator", "Graphs", 15, "gold"),
  topicBadge("topic-dp", "DP Dominator", "Dynamic Programming", 20, "gold"),
  topicBadge("topic-advdp", "State Machine", "Advanced Dynamic Programming", 10, "platinum"),
  topicBadge("topic-heaps", "Heap Handler", "Heaps & Priority Queues", 10, "silver"),
  topicBadge("topic-union", "Union Finder", "Union Find & Topological Sort", 10, "gold"),
  topicBadge("topic-bsearch", "Binary Sniper", "Binary Search on Answer", 10, "gold"),

  /* -------------------------- Lectures & interviews ------------------------- */
  threshold("lect-1", "Class in Session", "Finish your first lecture.", "bronze", "learning", 1, (s) => s.lectures),
  threshold("lect-10", "Diligent Student", "Finish 10 lectures.", "silver", "learning", 10, (s) => s.lectures),
  threshold("lect-25", "Course Complete", "Finish 25 lectures.", "gold", "learning", 25, (s) => s.lectures),
  threshold("int-1", "First Interview", "Complete a mock interview.", "bronze", "learning", 1, (s) => s.interviews),
  threshold("int-5", "Seasoned Candidate", "Complete 5 mock interviews.", "silver", "learning", 5, (s) => s.interviews),
  threshold("int-15", "Offer Magnet", "Complete 15 mock interviews.", "platinum", "learning", 15, (s) => s.interviews),
];

export const BADGES_BY_ID: Record<string, Badge> = Object.fromEntries(BADGES.map((b) => [b.id, b]));

export const FAMILY_LABEL: Record<BadgeFamily, string> = {
  xp: "XP & levels",
  streak: "Streaks",
  problems: "Problems solved",
  difficulty: "Difficulty",
  topic: "Topic mastery",
  learning: "Lectures & interviews",
};

export const TIER_STYLE: Record<BadgeTier, { label: string; ring: string; text: string }> = {
  bronze: { label: "Bronze", ring: "ring-amber-700/40", text: "text-amber-500" },
  silver: { label: "Silver", ring: "ring-slate-400/40", text: "text-slate-300" },
  gold: { label: "Gold", ring: "ring-yellow-500/40", text: "text-yellow-400" },
  platinum: { label: "Platinum", ring: "ring-cyan-400/40", text: "text-cyan-300" },
};

/** Ids of every badge whose condition is currently met. */
export function earnedBadgeIds(stats: LearnerStats): string[] {
  return BADGES.filter((b) => b.progress(stats) >= b.goal).map((b) => b.id);
}
