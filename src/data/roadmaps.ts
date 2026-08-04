export type RoadmapStep = {
  id: string;
  title: string;
  outcome: string;
  tasks: string[];
  hours: number;
};

export type RoadmapPhase = {
  id: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  weeks: string;
  goal: string;
  project: string;
  steps: RoadmapStep[];
};

export type Roadmap = {
  id: string;
  title: string;
  tagline: string;
  totalWeeks: number;
  audience: string;
  phases: RoadmapPhase[];
};

const p = (
  id: string,
  name: string,
  level: RoadmapPhase["level"],
  weeks: string,
  goal: string,
  project: string,
  steps: Array<[string, string, string[], number]>,
): RoadmapPhase => ({
  id,
  name,
  level,
  weeks,
  goal,
  project,
  steps: steps.map(([title, outcome, tasks, hours], i) => ({
    id: `${id}-${i + 1}`,
    title,
    outcome,
    tasks,
    hours,
  })),
});

export const ROADMAPS: Roadmap[] = [
  {
    id: "dsa",
    title: "DSA & Problem Solving",
    tagline: "From your first loop to solving hard graph problems under interview pressure.",
    totalWeeks: 20,
    audience: "Anyone targeting product-company interviews.",
    phases: [
      p(
        "dsa-a",
        "Foundations",
        "Beginner",
        "Weeks 1–4",
        "Write correct code without looking things up, and reason about loops confidently.",
        "Build a CLI contact book with search, sort and file persistence.",
        [
          ["Pick one language and stick with it", "You can write 30 lines from memory without syntax errors.", ["Choose Python, Java or C++", "Learn types, loops, conditionals, functions", "Solve 20 warm-up problems"], 14],
          ["Arrays and strings", "You stop reaching for nested loops by reflex.", ["Traversal patterns", "Prefix sums", "Two pointers", "Solve 30 easy array/string problems"], 22],
          ["Time & space complexity", "You can state Big-O for your own code instantly.", ["Counting operations", "Best/average/worst case", "Space vs time trade-offs"], 8],
          ["Recursion basics", "Recursion stops feeling like magic.", ["Base case discipline", "Call stack tracing", "Factorial, Fibonacci, subsets"], 12],
        ],
      ),
      p(
        "dsa-b",
        "Core Structures",
        "Intermediate",
        "Weeks 5–12",
        "Know which structure to reach for before you write any code.",
        "Implement your own HashMap, LinkedList and MinHeap from scratch, with tests.",
        [
          ["Hashing", "You spot O(n²) → O(n) conversions instantly.", ["Hash maps and sets", "Frequency counting", "Anagram and subarray patterns"], 16],
          ["Linked lists, stacks, queues", "Pointer manipulation stops scaring you.", ["Reversal, cycle detection", "Monotonic stack", "Sliding window with deque"], 20],
          ["Trees & BSTs", "You can write any traversal iteratively or recursively.", ["DFS/BFS traversal", "BST insert, delete, validate", "Lowest common ancestor", "Tree DP basics"], 24],
          ["Sorting & searching", "Binary search becomes a tool, not a topic.", ["Merge/quick sort internals", "Binary search on answers", "Custom comparators"], 14],
          ["Heaps & intervals", "Top-K and scheduling problems become routine.", ["Priority queues", "K-way merge", "Interval merging and sweep line"], 12],
        ],
      ),
      p(
        "dsa-c",
        "Interview Grade",
        "Advanced",
        "Weeks 13–20",
        "Solve unseen medium problems in 25 minutes while narrating your thinking.",
        "A 60-problem solved repo with written intuition notes for each.",
        [
          ["Graphs", "You can model messy problems as graphs quickly.", ["BFS/DFS on grids", "Topological sort", "Dijkstra and union-find", "Cycle detection both directions"], 26],
          ["Dynamic programming", "You derive recurrences instead of memorising them.", ["Memoise-then-tabulate recipe", "Knapsack family", "LIS, LCS, edit distance", "DP on grids and trees"], 30],
          ["Greedy & backtracking", "You know when greedy is provably safe.", ["Exchange argument intuition", "N-Queens, permutations, sudoku", "Pruning strategies"], 16],
          ["Mock interview loop", "Pressure stops changing your performance.", ["3 timed mocks per week in the Interview Studio", "Record and review your explanations", "Redo every problem you failed after 48 hours"], 20],
        ],
      ),
    ],
  },
  {
    id: "fullstack",
    title: "Full-Stack Web Engineer",
    tagline: "Ship real products: frontend, backend, database, deploy.",
    totalWeeks: 18,
    audience: "Students who want an internship portfolio that actually works.",
    phases: [
      p(
        "fs-a",
        "The Web, Properly",
        "Beginner",
        "Weeks 1–4",
        "Build and deploy a static site you're not embarrassed by.",
        "A personal portfolio, responsive and deployed on a real URL.",
        [
          ["HTML & semantics", "Your markup is accessible by default.", ["Document structure", "Forms and labels", "Landmarks and alt text"], 8],
          ["CSS layout", "Flexbox and grid stop being trial and error.", ["Box model", "Flexbox", "Grid", "Responsive breakpoints"], 16],
          ["JavaScript fundamentals", "You can manipulate the DOM without a framework.", ["Types, scope, closures", "Array methods", "Events and the DOM", "fetch and JSON"], 22],
        ],
      ),
      p(
        "fs-b",
        "Applications",
        "Intermediate",
        "Weeks 5–12",
        "Build a multi-page app with real data and real auth.",
        "A full CRUD app with login, roles and a dashboard.",
        [
          ["React", "You think in components and state.", ["Props, state, effects", "Lists and keys", "Routing", "Forms and validation"], 26],
          ["TypeScript", "Runtime bugs move to compile time.", ["Types and interfaces", "Generics", "Typing API responses"], 14],
          ["APIs & databases", "You can design a schema and query it well.", ["REST design", "SQL joins and indexes", "Row-level security", "Migrations"], 22],
          ["Auth & state", "You handle sessions without hand-waving.", ["Sessions vs JWT", "Protected routes", "Server-side data fetching and caching"], 16],
        ],
      ),
      p(
        "fs-c",
        "Production",
        "Advanced",
        "Weeks 13–18",
        "Deploy, monitor and defend your architecture choices in an interview.",
        "A deployed product with CI, tests and an architecture write-up.",
        [
          ["Testing", "You trust your own refactors.", ["Unit tests", "Integration tests", "Playwright end-to-end"], 14],
          ["Performance", "You can explain why a page is slow.", ["Bundle analysis", "Caching layers", "N+1 query hunting", "Core Web Vitals"], 12],
          ["Deployment & CI/CD", "Shipping stops being an event.", ["Environments and secrets", "GitHub Actions", "Rollbacks and monitoring"], 12],
          ["System design for web", "You can whiteboard your own product.", ["Caching, CDNs, queues", "Rate limiting", "Scaling reads vs writes"], 14],
        ],
      ),
    ],
  },
  {
    id: "aiml",
    title: "AI / Machine Learning",
    tagline: "Maths → models → deployed ML systems.",
    totalWeeks: 22,
    audience: "Students aiming at data science and ML engineering roles.",
    phases: [
      p(
        "ml-a",
        "Foundations",
        "Beginner",
        "Weeks 1–6",
        "Comfortable with Python data tooling and the maths that matters.",
        "An exploratory data analysis notebook on a real public dataset.",
        [
          ["Python for data", "NumPy and pandas feel natural.", ["NumPy arrays and broadcasting", "pandas dataframes", "Matplotlib/Seaborn plots"], 20],
          ["Maths you actually need", "You can read an ML paper's notation.", ["Linear algebra: vectors, matrices, eigen", "Calculus: gradients", "Probability and distributions"], 24],
          ["Statistics", "You know when a result is noise.", ["Descriptive stats", "Hypothesis testing", "Bias and variance"], 12],
        ],
      ),
      p(
        "ml-b",
        "Classical ML",
        "Intermediate",
        "Weeks 7–14",
        "Train, evaluate and explain models without a black box excuse.",
        "A Kaggle-style competition entry with a documented pipeline.",
        [
          ["Supervised learning", "You pick models on evidence.", ["Linear/logistic regression", "Trees and random forests", "Gradient boosting", "SVMs"], 24],
          ["Evaluation", "Accuracy stops being your only metric.", ["Train/val/test discipline", "Cross-validation", "Precision, recall, ROC-AUC", "Leakage detection"], 12],
          ["Feature engineering", "Your models improve without changing algorithms.", ["Encoding, scaling, imputation", "Feature selection", "Pipelines"], 14],
          ["Unsupervised learning", "You can find structure in unlabelled data.", ["K-means", "PCA", "Anomaly detection"], 10],
        ],
      ),
      p(
        "ml-c",
        "Deep Learning & Deployment",
        "Advanced",
        "Weeks 15–22",
        "Build neural networks and serve them behind an API.",
        "A deployed model with an inference API and a small web front end.",
        [
          ["Neural networks", "Backprop is intuition, not a formula.", ["Perceptrons and activations", "Backpropagation by hand", "PyTorch basics", "Regularisation"], 24],
          ["Modern architectures", "You understand what powers current models.", ["CNNs for vision", "RNNs and attention", "Transformers", "Transfer learning and fine-tuning"], 26],
          ["LLM applications", "You can build with models, not just train them.", ["Prompting and structured output", "RAG and embeddings", "Evaluation of LLM apps"], 16],
          ["MLOps", "Your model survives contact with users.", ["Experiment tracking", "Model serving", "Drift monitoring"], 14],
        ],
      ),
    ],
  },
  {
    id: "placement",
    title: "Placement Sprint (90 Days)",
    tagline: "A day-by-day plan for the last three months before campus season.",
    totalWeeks: 13,
    audience: "Final-year students with interviews on the calendar.",
    phases: [
      p(
        "pl-a",
        "Rebuild the Base",
        "Beginner",
        "Weeks 1–4",
        "Close every fundamental gap that would embarrass you in round one.",
        "One polished résumé and two projects rewritten with impact metrics.",
        [
          ["Résumé that passes ATS", "Recruiters can scan your value in 8 seconds.", ["One page, no photo, no rating bars", "XYZ bullets with numbers", "Keywords lifted from the job description", "Export as PDF named Firstname_Lastname.pdf"], 8],
          ["Language mastery refresh", "No syntax hesitations under pressure.", ["100 easy problems in your chosen language", "STL/collections API from memory"], 24],
          ["CS core sweep", "You answer OS/DBMS/networks questions crisply.", ["OS: processes, scheduling, deadlocks, memory", "DBMS: normalisation, indexes, ACID, joins", "Networks: TCP vs UDP, DNS, HTTP", "OOP: SOLID and real examples"], 26],
        ],
      ),
      p(
        "pl-b",
        "Interview Machinery",
        "Intermediate",
        "Weeks 5–9",
        "Convert knowledge into performance under a clock.",
        "50 medium problems solved with written intuition notes.",
        [
          ["Pattern-based DSA", "You recognise problem families instantly.", ["Two pointers, sliding window, binary search on answers", "Trees and graphs", "DP fundamentals", "Timed sets of 3 problems in 75 minutes"], 40],
          ["Aptitude & reasoning", "You clear the online round comfortably.", ["Quant: percentages, ratios, time-speed-distance", "Logical: series, puzzles, seating", "Verbal: RC and error spotting", "Two timed mocks per week"], 18],
          ["Project deep-dive prep", "You can defend every line of your projects.", ["Write an architecture note per project", "Prepare 3 hard questions an interviewer would ask", "Know your trade-offs and what you'd change"], 10],
        ],
      ),
      p(
        "pl-c",
        "Game Day",
        "Advanced",
        "Weeks 10–13",
        "Walk in calm, communicate clearly, negotiate well.",
        "Ten completed mock interviews with written debriefs.",
        [
          ["Mock interview loop", "Nerves stop changing your output.", ["3 mocks per week in the Interview Studio", "Review every debrief and fix one thing", "Practise thinking out loud"], 24],
          ["HR & behavioural", "Your stories land in under 2 minutes.", ["8 STAR stories: conflict, failure, leadership, deadline", "Tell me about yourself — 90 seconds, rehearsed", "Why this company — specific, researched"], 10],
          ["System design lite", "You handle the scale question freshers get.", ["Design a URL shortener", "Design a chat app", "Caching, load balancing, databases"], 14],
          ["Offer & negotiation", "You don't leave money or clarity on the table.", ["Understand CTC vs in-hand", "Ask for the written offer", "One polite counter, backed by data"], 6],
        ],
      ),
    ],
  },
];

export function getRoadmapById(id: string): Roadmap | undefined {
  return ROADMAPS.find((r) => r.id === id);
}
