# Achievements, AI Code Review, and Deeper DSA Content

Four additions: an achievements/badges system, an AI code review panel on every problem, and a big expansion of DSA lectures, mock interviews, problems and roadmap depth.

## 1. Achievements and badges

A new Achievements page (sidebar entry) plus a badge strip on the dashboard.

Badges unlock automatically from data already tracked — XP, level, streak, solved problems, lectures watched, interviews completed. Roughly 30 badges across four families:

- XP/level: First Steps (25 XP), Grinder (500), Machine (2,000), Legend (10,000)
- Streak: 3, 7, 14, 30, 100 day streaks
- Problems: 1, 10, 50, 100, 250, 500 solved; plus per-difficulty (25 Easy, 25 Medium, 10 Hard) and per-topic mastery (Arrays, Graphs, DP, Trees…)
- Lectures and interviews: 1/10/25 lectures finished, 1/5/15 mock interviews completed

Each badge shows tier (bronze/silver/gold/platinum), a short description, and a progress bar toward the next one. Locked badges appear dimmed with "3 / 10 solved" style progress so goals are visible. Unlocking one fires a toast celebration in the moment it happens.

## 2. Code review panel on problem pages

The problem modal gains a second tab next to the editor: **Review my solution**.

You paste or write your solution in the existing editor, press Review, and the AI returns a structured critique instead of a chat blob:

- Verdict line (correct / buggy / works but slow)
- Time and space complexity of your code vs. the optimal
- Concrete issues, each with the offending idea and the fix
- A short list of improvements ranked by impact
- An optional cleaner version of the solution

Your code is saved per problem and language, so returning to a problem restores what you wrote and your last review.

## 3. More DSA content

- **Lectures**: a dedicated DSA track expanded to ~35 lectures covering arrays, strings, hashing, two pointers, sliding window, recursion, backtracking, sorting, binary search, linked lists, stacks/queues, trees, BST, heaps, tries, graphs, BFS/DFS, topological sort, shortest paths, DSU, greedy, DP (1D/2D/knapsack/LIS/digit), segment trees and bit manipulation.
- **Problems**: DSA bank grows to 250+ additional problems mapped onto those topics, tagged by difficulty and pattern, all with starter code in the existing 12 languages.
- **Mock interviews**: 10 new DSA-focused personas (pattern drills, whiteboard round, optimize-under-pressure, debug-my-code, complexity interrogation, follow-up ladder, FAANG phone screen, contest-style speed round, and two behavioural-plus-code hybrids).
- **Roadmap**: the DSA roadmap becomes a detailed, clickable path — each week opens its own page listing the exact lectures to watch, problems to solve, patterns to internalise, and a self-check quiz question set. Progress ticks off as you complete the linked lectures and problems.

## Technical notes

- Badge definitions live in `src/data/achievements.ts` as pure rules evaluated against existing progress data — no new tables needed except a small `achievements` table recording `user_id`, `badge_id`, `unlocked_at` so unlock time and "new" state persist (RLS scoped to `auth.uid()`, with GRANTs).
- Unlock evaluation runs server-side inside the existing XP award path in `src/lib/xp.server.ts`, so awards and badges stay consistent; the client just invalidates the `achievements` query.
- Code review uses a new `reviewSolution` server function calling the Lovable AI Gateway with the existing `CODE_REVIEW_SYSTEM_PROMPT`, returning a structured object (verdict, complexity, issues[], improvements[], optionalRewrite) rather than free text, rendered as a panel.
- Saved code persists to the existing `problem_progress.code` / `.language` columns via a `saveSolution` server function.
- New routes: `/achievements` and `/roadmaps/$roadmapId/$stepId` under the authenticated layout, each with its own head metadata.
- Content additions extend `src/data/lectures.ts`, `problems.ts`, `interviews.ts`, `roadmaps.ts` using their current generators and shapes.
