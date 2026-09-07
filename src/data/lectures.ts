export type Lecture = {
  id: string;
  title: string;
  author: string;
  track: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  minutes: number;
  videoId: string;
  summary: string;
};

/**
 * In-app lecture library. Every lecture plays inside the app in an embedded
 * privacy-friendly player — no external navigation required.
 */
export const LECTURES: Lecture[] = [
  {
    id: "py-full",
    title: "Python for Beginners — Full Course",
    author: "freeCodeCamp",
    track: "Python",
    level: "Beginner",
    minutes: 258,
    videoId: "rfscVS0vtbw",
    summary: "Variables, control flow, functions, OOP and file handling from absolute zero.",
  },
  {
    id: "py-oop",
    title: "Object Oriented Python, Properly",
    author: "Corey Schafer",
    track: "Python",
    level: "Intermediate",
    minutes: 96,
    videoId: "ZDa-Z5JzLYM",
    summary: "Classes, inheritance, class methods, dunder methods and when composition beats inheritance.",
  },
  {
    id: "js-full",
    title: "JavaScript Programming — Full Course",
    author: "freeCodeCamp",
    track: "JavaScript",
    level: "Beginner",
    minutes: 204,
    videoId: "PkZNo7MFNFg",
    summary: "The language from syntax to closures, async and the DOM.",
  },
  {
    id: "js-async",
    title: "Async JavaScript: Event Loop, Promises, async/await",
    author: "Fireship / deep dive",
    track: "JavaScript",
    level: "Intermediate",
    minutes: 41,
    videoId: "8aGhZQkoFbQ",
    summary: "Why your callbacks fire in a weird order, and the mental model that fixes it forever.",
  },
  {
    id: "ts-full",
    title: "TypeScript Course for Beginners",
    author: "Academind",
    track: "TypeScript",
    level: "Beginner",
    minutes: 187,
    videoId: "BwuLxPH8IDs",
    summary: "Types, generics, interfaces and how to stop fighting the compiler.",
  },
  {
    id: "java-full",
    title: "Java Full Course",
    author: "Programming with Mosh",
    track: "Java",
    level: "Beginner",
    minutes: 152,
    videoId: "eIrMbAQSU34",
    summary: "JVM basics, types, collections, OOP and exception handling.",
  },
  {
    id: "cpp-full",
    title: "C++ Full Course",
    author: "freeCodeCamp",
    track: "C++",
    level: "Beginner",
    minutes: 250,
    videoId: "vLnPwxZdW4Y",
    summary: "Pointers, references, STL containers, templates and RAII.",
  },
  {
    id: "c-full",
    title: "C Programming Tutorial for Beginners",
    author: "freeCodeCamp",
    track: "C",
    level: "Beginner",
    minutes: 224,
    videoId: "KJgsSFOSQv0",
    summary: "Memory, pointers, arrays, structs and manual allocation — the fundamentals everything else stands on.",
  },
  {
    id: "dsa-full",
    title: "Data Structures Easy to Advanced",
    author: "William Fiset",
    track: "DSA",
    level: "Intermediate",
    minutes: 480,
    videoId: "RBSGKlAvoiM",
    summary: "Arrays, linked lists, stacks, queues, heaps, trees, hash tables and union-find with implementations.",
  },
  {
    id: "algo-full",
    title: "Algorithms and Data Structures Tutorial",
    author: "freeCodeCamp",
    track: "DSA",
    level: "Intermediate",
    minutes: 320,
    videoId: "8hly31xKli0",
    summary: "Recursion, sorting, searching, dynamic programming and graph algorithms.",
  },
  {
    id: "dp-masterclass",
    title: "Dynamic Programming — Memoization to Tabulation",
    author: "freeCodeCamp",
    track: "DSA",
    level: "Advanced",
    minutes: 300,
    videoId: "oBt53YbR9Kk",
    summary: "The five-step recipe that turns any recursive brute force into an optimal DP.",
  },
  {
    id: "graphs",
    title: "Graph Algorithms for Technical Interviews",
    author: "freeCodeCamp",
    track: "DSA",
    level: "Advanced",
    minutes: 108,
    videoId: "tWVWeAqZ0WU",
    summary: "BFS, DFS, connected components, topological sort and shortest paths as interview patterns.",
  },
  {
    id: "sql-full",
    title: "SQL Tutorial — Full Database Course",
    author: "freeCodeCamp",
    track: "Databases",
    level: "Beginner",
    minutes: 264,
    videoId: "HXV3zeQKqGY",
    summary: "SELECT to joins, normalisation, indexes and transactions.",
  },
  {
    id: "dbms",
    title: "DBMS Fundamentals for Placements",
    author: "Gate Smashers",
    track: "Databases",
    level: "Intermediate",
    minutes: 180,
    videoId: "3EJlovevfcA",
    summary: "ER models, normal forms, ACID, concurrency control and indexing — the exact DBMS interview surface.",
  },
  {
    id: "os",
    title: "Operating Systems Crash Course",
    author: "Neso Academy",
    track: "CS Core",
    level: "Intermediate",
    minutes: 240,
    videoId: "vBURTt97EkA",
    summary: "Processes, threads, scheduling, deadlocks, paging and virtual memory.",
  },
  {
    id: "networks",
    title: "Computer Networking Full Course",
    author: "freeCodeCamp",
    track: "CS Core",
    level: "Intermediate",
    minutes: 240,
    videoId: "qiQR5rTSshw",
    summary: "OSI, TCP/IP, DNS, HTTP, routing and what actually happens when you type a URL.",
  },
  {
    id: "sysdesign",
    title: "System Design for Beginners",
    author: "freeCodeCamp",
    track: "System Design",
    level: "Advanced",
    minutes: 200,
    videoId: "m8Icp_Cid5o",
    summary: "Load balancing, caching, sharding, queues, CAP theorem and designing for scale.",
  },
  {
    id: "sysdesign-interview",
    title: "System Design Interview — Walkthroughs",
    author: "ByteByteGo style",
    track: "System Design",
    level: "Advanced",
    minutes: 90,
    videoId: "bUHFg8CZFws",
    summary: "Designing a URL shortener, a news feed and a rate limiter, end to end.",
  },
  {
    id: "react",
    title: "React Course — Beginner to Confident",
    author: "freeCodeCamp",
    track: "Web",
    level: "Beginner",
    minutes: 290,
    videoId: "bMknfKXIFA8",
    summary: "Components, state, effects, routing and building a real project.",
  },
  {
    id: "css",
    title: "CSS & Modern Layout",
    author: "Traversy Media",
    track: "Web",
    level: "Beginner",
    minutes: 85,
    videoId: "yfoY53QXEnI",
    summary: "Box model, flexbox, grid and responsive design without guesswork.",
  },
  {
    id: "node",
    title: "Node.js and Express Full Course",
    author: "freeCodeCamp",
    track: "Web",
    level: "Intermediate",
    minutes: 480,
    videoId: "Oe421EPjeBE",
    summary: "HTTP servers, middleware, REST APIs, auth and deployment.",
  },
  {
    id: "git",
    title: "Git and GitHub for Beginners",
    author: "freeCodeCamp",
    track: "Tooling",
    level: "Beginner",
    minutes: 69,
    videoId: "RGOj5yH7evk",
    summary: "Commits, branches, merges, rebases and pull request workflow.",
  },
  {
    id: "docker",
    title: "Docker Tutorial for Beginners",
    author: "TechWorld with Nana",
    track: "Tooling",
    level: "Intermediate",
    minutes: 180,
    videoId: "3c-iBn73dDE",
    summary: "Images, containers, volumes, networks and Docker Compose.",
  },
  {
    id: "linux",
    title: "Linux Command Line Essentials",
    author: "freeCodeCamp",
    track: "Tooling",
    level: "Beginner",
    minutes: 300,
    videoId: "ZtqBQ68cfJc",
    summary: "Files, permissions, pipes, processes and shell scripting.",
  },
  {
    id: "ml",
    title: "Machine Learning for Everybody",
    author: "freeCodeCamp",
    track: "AI/ML",
    level: "Beginner",
    minutes: 230,
    videoId: "i_LwzRVP7bg",
    summary: "Supervised learning, classification, regression and neural nets in Python.",
  },
  {
    id: "dl",
    title: "Deep Learning Crash Course",
    author: "freeCodeCamp",
    track: "AI/ML",
    level: "Advanced",
    minutes: 220,
    videoId: "VyWAvY2CF9c",
    summary: "Backpropagation, CNNs, RNNs and transformers explained with code.",
  },
  {
    id: "go",
    title: "Go Programming — Full Course",
    author: "freeCodeCamp",
    track: "Go",
    level: "Beginner",
    minutes: 400,
    videoId: "un6ZyFkqFKo",
    summary: "Goroutines, channels, interfaces and idiomatic Go.",
  },
  {
    id: "rust",
    title: "Rust Programming Course",
    author: "freeCodeCamp",
    track: "Rust",
    level: "Intermediate",
    minutes: 830,
    videoId: "BpPEoZW5IiY",
    summary: "Ownership, borrowing, lifetimes, traits and error handling.",
  },
  {
    id: "oop",
    title: "Object Oriented Design Principles (SOLID)",
    author: "Christopher Okhravi",
    track: "CS Core",
    level: "Intermediate",
    minutes: 75,
    videoId: "pTB0EiLXUC8",
    summary: "SOLID, design patterns and how interviewers probe your design instincts.",
  },
  {
    id: "aptitude",
    title: "Aptitude & Logical Reasoning for Placements",
    author: "Love Babbar",
    track: "Placement",
    level: "Beginner",
    minutes: 22,
    videoId: "B8dZvuG2yEE",
    summary: "Percentages, ratios, time-and-work, permutations and puzzle patterns companies reuse.",
  },
];

export const LECTURE_TRACKS = Array.from(new Set(LECTURES.map((l) => l.track)));

export function getLectureById(id: string): Lecture | undefined {
  return LECTURES.find((l) => l.id === id);
}

export type LectureDetail = {
  /** A longer, human description of what the video actually covers. */
  description: string;
  /** Chapter-style topics covered, in order. */
  topics: string[];
  /** Who this lecture is for / what you should already know. */
  bestFor: string;
};

export const LECTURE_DETAILS: Record<string, LectureDetail> = {
  "py-full": {
    description:
      "A complete first pass at Python with zero assumptions. You write code from the first ten minutes, and by the end you have built small programs with functions, files and classes. This is the lecture to watch if you have never programmed before.",
    topics: ["Setup & first program", "Variables and types", "Conditionals and loops", "Functions", "Lists, dicts, sets", "Files and modules", "Classes and OOP"],
    bestFor: "Absolute beginners choosing their first language.",
  },
  "py-oop": {
    description:
      "Goes past 'a class is a blueprint' and shows how professional Python codebases actually use objects. Covers the dunder methods interviewers ask about and when a plain function beats a class.",
    topics: ["Instance vs class attributes", "classmethod & staticmethod", "Inheritance", "Dunder methods", "Properties", "Composition over inheritance"],
    bestFor: "You know Python basics and want interview-grade OOP answers.",
  },
  "js-full": {
    description:
      "The whole language in one sitting: syntax, functions, objects, the DOM and asynchronous code. Ends with real browser projects so the concepts stick.",
    topics: ["Syntax & types", "Functions and scope", "Objects and arrays", "DOM manipulation", "Events", "Fetch & async basics", "Mini projects"],
    bestFor: "Anyone starting web development.",
  },
  "js-async": {
    description:
      "The mental model behind the event loop, explained with the call stack and task queues drawn out. After this, promise ordering puzzles in interviews stop being guesswork.",
    topics: ["Call stack", "Event loop", "Microtasks vs macrotasks", "Promises", "async/await", "Common ordering traps"],
    bestFor: "Developers who can write JS but get surprised by execution order.",
  },
  "ts-full": {
    description:
      "TypeScript from installation to advanced generics, with the reasoning behind each type feature. Focuses on making the compiler help you instead of fighting it.",
    topics: ["Setup & tsconfig", "Basic types", "Interfaces vs types", "Unions and narrowing", "Generics", "Utility types", "TS with React"],
    bestFor: "JavaScript developers moving to typed codebases.",
  },
  "java-full": {
    description:
      "A tight, practical Java course: how the JVM runs your code, the type system, collections and the OOP model that most placement interviews still test.",
    topics: ["JVM & compilation", "Types and operators", "Control flow", "Arrays and collections", "Classes and interfaces", "Exceptions"],
    bestFor: "Students whose campus placement tests use Java.",
  },
  "cpp-full": {
    description:
      "C++ for competitive programming and systems work. Spends real time on pointers, references and the STL containers you will reach for in every contest.",
    topics: ["Compilation model", "Pointers & references", "Memory management", "STL containers", "Iterators & algorithms", "Templates", "RAII"],
    bestFor: "Competitive programmers and anyone doing DSA in C++.",
  },
  "c-full": {
    description:
      "The language everything else is built on. Manual memory, pointer arithmetic and structs, taught slowly enough that segfaults start making sense.",
    topics: ["Compilation", "Variables and I/O", "Pointers", "Arrays and strings", "Structs", "Dynamic allocation", "File handling"],
    bestFor: "First-year students and embedded/systems tracks.",
  },
  "dsa-full": {
    description:
      "The reference course for data structures. Every structure is explained visually, then implemented, then analysed — so you can both use it and build it from memory in an interview.",
    topics: ["Big-O", "Arrays & dynamic arrays", "Linked lists", "Stacks & queues", "Priority queues / heaps", "Union-find", "Binary trees & BSTs", "Hash tables"],
    bestFor: "Anyone starting serious interview preparation.",
  },
  "algo-full": {
    description:
      "Algorithms rather than containers: how to design one, prove it terminates, and analyse its cost. Sorting, searching, recursion, DP and graphs with worked examples.",
    topics: ["Recursion", "Sorting algorithms", "Binary search", "Greedy", "Dynamic programming", "Graph traversal", "Shortest paths"],
    bestFor: "You know the data structures and need the algorithms.",
  },
  "dp-masterclass": {
    description:
      "Dynamic programming taught as a repeatable recipe: write the brute force, find the repeated state, memoise, then flip it to a table. Dozens of classic problems solved on screen.",
    topics: ["Recursive brute force", "Identifying state", "Memoisation", "Tabulation", "Space optimisation", "Grid DP", "Knapsack family", "String DP"],
    bestFor: "The single highest-return topic for product-company interviews.",
  },
  graphs: {
    description:
      "Graphs framed as interview patterns rather than theory. Each algorithm is paired with the question shape that signals you should use it.",
    topics: ["Representations", "BFS", "DFS", "Connected components", "Cycle detection", "Topological sort", "Dijkstra", "Union-find"],
    bestFor: "Intermediate learners preparing for on-site rounds.",
  },
  "sql-full": {
    description:
      "Hands-on SQL against a real database: querying, joining, aggregating, then designing schemas properly. Includes the join and grouping questions that show up in analytics rounds.",
    topics: ["SELECT & filtering", "Joins", "Aggregations & GROUP BY", "Subqueries", "Keys & normalisation", "Indexes", "Transactions"],
    bestFor: "Everyone — SQL appears in nearly every interview loop.",
  },
  dbms: {
    description:
      "The theory side of databases exactly as placement papers test it: ER diagrams, normal forms up to BCNF, ACID, isolation levels and indexing trade-offs.",
    topics: ["ER modelling", "Relational algebra", "Normalisation 1NF–BCNF", "ACID", "Concurrency control", "Indexing", "Query processing"],
    bestFor: "Written tests and DBMS viva rounds.",
  },
  os: {
    description:
      "Operating systems from the process abstraction upward, with the classic problems (deadlock, scheduling, paging) worked through numerically the way exams ask them.",
    topics: ["Processes & threads", "CPU scheduling", "Synchronisation", "Deadlocks", "Memory management", "Paging & virtual memory", "File systems"],
    bestFor: "Core CS rounds and OS-heavy written tests.",
  },
  networks: {
    description:
      "Follows a single request through the whole stack, layer by layer, so the OSI model stops being a list to memorise and becomes a story you can retell in an interview.",
    topics: ["OSI & TCP/IP layers", "Ethernet & switching", "IP addressing", "Routing", "TCP vs UDP", "DNS", "HTTP/HTTPS"],
    bestFor: "\"What happens when you type a URL?\" — asked constantly.",
  },
  sysdesign: {
    description:
      "The vocabulary and building blocks of scalable systems, explained before any full design is attempted. Every component is introduced with the failure it exists to prevent.",
    topics: ["Client-server basics", "Load balancing", "Caching", "Database scaling", "Sharding & replication", "Message queues", "CAP theorem"],
    bestFor: "First exposure to system design.",
  },
  "sysdesign-interview": {
    description:
      "Three complete design walkthroughs at interview pace — requirements, estimates, API, data model, scale-out, then trade-offs. Watch how the answer is structured, not just what it contains.",
    topics: ["Requirement gathering", "Back-of-envelope estimates", "URL shortener", "News feed", "Rate limiter", "Trade-off discussion"],
    bestFor: "Anyone with a design round scheduled.",
  },
  react: {
    description:
      "React with the modern hooks-first approach, building up to a full project. Explains re-rendering clearly, which is where most self-taught developers get stuck.",
    topics: ["JSX & components", "Props and state", "Events", "useEffect", "Lists and keys", "Routing", "Project build"],
    bestFor: "Frontend track and project work for your resume.",
  },
  css: {
    description:
      "Layout without trial and error. The box model, flexbox and grid are each explained with the rules that actually govern them, then applied to responsive pages.",
    topics: ["Box model", "Positioning", "Flexbox", "CSS Grid", "Responsive units", "Media queries"],
    bestFor: "Developers whose layouts 'almost' work.",
  },
  node: {
    description:
      "Backend JavaScript end to end: HTTP servers, Express routing, middleware, databases, authentication and deployment, built as one continuous application.",
    topics: ["Node runtime", "HTTP module", "Express routing", "Middleware", "REST API design", "Database integration", "Auth", "Deployment"],
    bestFor: "Building a full-stack project you can demo.",
  },
  git: {
    description:
      "Version control the way teams use it. Covers the mental model of commits as snapshots, then branching, merging, rebasing and the pull request workflow.",
    topics: ["Repositories & commits", "Branches", "Merging", "Rebase", "Remotes & GitHub", "Pull requests", "Undoing mistakes"],
    bestFor: "Required before any internship or team project.",
  },
  docker: {
    description:
      "Containers explained by first showing the problem they solve. Builds images, runs multi-container apps with Compose and covers volumes and networking.",
    topics: ["Why containers", "Images vs containers", "Dockerfile", "Volumes", "Networks", "Docker Compose", "Debugging containers"],
    bestFor: "DevOps interest and deploying your projects.",
  },
  linux: {
    description:
      "The command line as a working environment: navigating, permissions, piping commands together, managing processes and writing your first shell scripts.",
    topics: ["Filesystem & navigation", "File operations", "Permissions", "Pipes & redirection", "Processes", "Package management", "Shell scripting"],
    bestFor: "Every developer, especially before internships.",
  },
  ml: {
    description:
      "Machine learning without heavy mathematics first — intuition, then the code in Python, then just enough theory to explain your choices in an interview.",
    topics: ["What ML is", "Classification", "Regression", "Train/test split", "Evaluation metrics", "Neural network basics", "TensorFlow intro"],
    bestFor: "Beginners exploring the AI/ML track.",
  },
  dl: {
    description:
      "Deep learning architectures with the intuition behind each one: why convolutions suit images, why attention replaced recurrence, and how backpropagation actually updates weights.",
    topics: ["Neural networks", "Backpropagation", "CNNs", "RNNs & LSTMs", "Attention", "Transformers", "Training tricks"],
    bestFor: "Learners who already know basic ML and Python.",
  },
  go: {
    description:
      "Go from syntax to concurrency. The goroutine and channel sections are the reason to watch — they are the parts backend interviews probe.",
    topics: ["Syntax & types", "Structs & methods", "Interfaces", "Error handling", "Goroutines", "Channels & select", "Standard library"],
    bestFor: "Backend and infrastructure roles.",
  },
  rust: {
    description:
      "A long, careful Rust course that spends the time ownership and lifetimes deserve. Slow going at first, then everything clicks and the borrow checker becomes an ally.",
    topics: ["Ownership", "Borrowing & references", "Lifetimes", "Structs & enums", "Pattern matching", "Traits & generics", "Error handling", "Concurrency"],
    bestFor: "Systems programming and performance-critical work.",
  },
  oop: {
    description:
      "Design principles taught with small, believable examples rather than abstract shapes. Each SOLID principle is shown as a bug it prevents, which makes it memorable in interviews.",
    topics: ["Single responsibility", "Open/closed", "Liskov substitution", "Interface segregation", "Dependency inversion", "Common patterns"],
    bestFor: "Low-level design and OOP rounds.",
  },
  aptitude: {
    description:
      "A focused briefing on how placement aptitude tests are structured, which topics carry the most marks, and how to build a practice routine that fits around your coding preparation.",
    topics: ["Test structure", "Quantitative topics", "Logical reasoning", "Verbal ability", "Time strategy", "Practice plan"],
    bestFor: "Anyone sitting campus or service-company placement tests.",
  },
};

export function getLectureDetail(id: string): LectureDetail | undefined {
  return LECTURE_DETAILS[id];
}
