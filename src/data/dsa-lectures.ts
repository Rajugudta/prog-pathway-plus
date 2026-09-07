export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
};

export type DsaLecture = {
  id: string;
  title: string;
  author: string;
  module: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  minutes: number;
  videoId: string;
  summary: string;
  keyIdeas: string[];
  quiz: QuizQuestion[];
};

/**
 * Dedicated DSA curriculum. Every lecture plays inside the app and ends with a
 * short comprehension quiz. Correct answers live server-side in
 * `src/lib/quiz-answers.server.ts` so they can never be read from the client.
 */
export const DSA_LECTURES: DsaLecture[] = [
  {
    id: "dsa-complexity",
    title: "Big-O, Time and Space Complexity",
    author: "CS Dojo",
    module: "Foundations",
    level: "Beginner",
    minutes: 60,
    videoId: "D6xkbGLQesk",
    summary: "How to reason about growth rates before you write a single line of code.",
    keyIdeas: [
      "Constants and lower-order terms drop out of Big-O",
      "Nested loops over the same input usually mean O(n^2)",
      "Space complexity counts extra memory, not the input itself",
    ],
    quiz: [
      {
        id: "q1",
        prompt: "What is the time complexity of two nested loops that each run n times?",
        options: ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"],
      },
      {
        id: "q2",
        prompt: "Binary search on a sorted array of n elements runs in:",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      },
      {
        id: "q3",
        prompt: "An in-place array reversal uses how much extra space?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
      },
    ],
  },
  {
    id: "dsa-arrays",
    title: "Arrays, Prefix Sums and Two Pointers",
    author: "CS Dojo",
    module: "Linear structures",
    level: "Beginner",
    minutes: 75,
    videoId: "On03HWe2tZM",
    summary: "The single most tested family of patterns: sliding windows, prefix sums and pointer pairs.",
    keyIdeas: [
      "Prefix sums turn range-sum queries into O(1)",
      "Two pointers require a sorted or monotonic property",
      "Sliding window fits 'longest/shortest subarray with ...' prompts",
    ],
    quiz: [
      {
        id: "q1",
        prompt: "After building a prefix-sum array, a range sum query costs:",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      },
      {
        id: "q2",
        prompt: "The two-pointer technique on an unsorted array usually requires:",
        options: ["Nothing extra", "Sorting first", "A hash map of indexes", "Recursion"],
      },
      {
        id: "q3",
        prompt: "Which problem is the sliding window a natural fit for?",
        options: [
          "Detecting a cycle in a linked list",
          "Longest substring without repeating characters",
          "Topological sorting",
          "Finding a minimum spanning tree",
        ],
      },
    ],
  },
  {
    id: "dsa-linkedlist",
    title: "Linked Lists: Reversal, Cycles and Merging",
    author: "William Fiset",
    module: "Linear structures",
    level: "Beginner",
    minutes: 55,
    videoId: "-Yn5DU0_-lw",
    summary: "Pointer surgery done calmly — reversal, fast/slow pointers and merge patterns.",
    keyIdeas: [
      "Floyd's tortoise and hare detects cycles in O(1) space",
      "Dummy head nodes remove edge-case branching",
      "Reversal is three pointers: prev, curr, next",
    ],
    quiz: [
      {
        id: "q1",
        prompt: "Floyd's cycle detection uses how much extra memory?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
      },
      {
        id: "q2",
        prompt: "Accessing the k-th element of a singly linked list costs:",
        options: ["O(1)", "O(log n)", "O(k)", "O(n log n)"],
      },
      {
        id: "q3",
        prompt: "A dummy head node is used mainly to:",
        options: [
          "Save memory",
          "Simplify insertions and deletions at the head",
          "Speed up traversal",
          "Enable random access",
        ],
      },
    ],
  },
  {
    id: "dsa-stacks-queues",
    title: "Stacks, Queues and Monotonic Stacks",
    author: "Neso Academy",
    module: "Linear structures",
    level: "Beginner",
    minutes: 50,
    videoId: "wjI1WNcIntg",
    summary: "LIFO/FIFO fundamentals, then the monotonic stack that cracks 'next greater element'.",
    keyIdeas: [
      "Balanced parentheses is the canonical stack problem",
      "A monotonic stack answers next-greater queries in O(n)",
      "Deques give O(1) sliding-window maxima",
    ],
    quiz: [
      {
        id: "q1",
        prompt: "Which structure evaluates balanced brackets naturally?",
        options: ["Queue", "Stack", "Heap", "Trie"],
      },
      {
        id: "q2",
        prompt: "Total complexity of the monotonic-stack 'next greater element' scan is:",
        options: ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"],
      },
      {
        id: "q3",
        prompt: "A queue removes elements in which order?",
        options: ["Last in, first out", "First in, first out", "Highest priority first", "Random"],
      },
    ],
  },
  {
    id: "dsa-hashing",
    title: "Hash Tables and Frequency Patterns",
    author: "freeCodeCamp",
    module: "Lookup structures",
    level: "Beginner",
    minutes: 45,
    videoId: "shs0KM3wKv8",
    summary: "Why hashing turns O(n^2) scans into O(n), and what happens on collisions.",
    keyIdeas: [
      "Average lookup O(1), worst case O(n) under heavy collisions",
      "Frequency maps solve anagram, duplicate and pairing problems",
      "Hash sets are the fastest 'seen before?' test",
    ],
    quiz: [
      {
        id: "q1",
        prompt: "Average-case lookup time in a well-sized hash table is:",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      },
      {
        id: "q2",
        prompt: "Chaining handles collisions by:",
        options: [
          "Rehashing the whole table",
          "Storing colliding entries in a list at the bucket",
          "Dropping the new entry",
          "Sorting the bucket array",
        ],
      },
      {
        id: "q3",
        prompt: "Two Sum in O(n) relies on:",
        options: ["Sorting", "A hash map of complements", "A heap", "Binary search"],
      },
    ],
  },
  {
    id: "dsa-trees",
    title: "Binary Trees and BST Traversals",
    author: "William Fiset",
    module: "Hierarchical structures",
    level: "Intermediate",
    minutes: 80,
    videoId: "fAAZixBzIAI",
    summary: "Preorder, inorder, postorder, level order — and the BST invariant that makes search fast.",
    keyIdeas: [
      "Inorder traversal of a BST yields sorted order",
      "Level order uses a queue (BFS)",
      "Balanced BST operations are O(log n); skewed trees degrade to O(n)",
    ],
    quiz: [
      {
        id: "q1",
        prompt: "Inorder traversal of a binary search tree produces:",
        options: ["Reverse sorted order", "Sorted ascending order", "Level order", "Random order"],
      },
      {
        id: "q2",
        prompt: "Level-order traversal is implemented with a:",
        options: ["Stack", "Queue", "Priority queue", "Union-find"],
      },
      {
        id: "q3",
        prompt: "Search in a degenerate (fully skewed) BST costs:",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      },
    ],
  },
  {
    id: "dsa-heaps",
    title: "Heaps, Priority Queues and Top-K",
    author: "Gate Smashers",
    module: "Hierarchical structures",
    level: "Intermediate",
    minutes: 45,
    videoId: "HqPJF2L5h9U",
    summary: "Binary heaps from scratch, then the top-K and streaming-median interview patterns.",
    keyIdeas: [
      "Push and pop are O(log n); peek is O(1)",
      "Heapify builds a heap in O(n)",
      "Top-K uses a size-K heap of the opposite polarity",
    ],
    quiz: [
      {
        id: "q1",
        prompt: "Extracting the minimum from a binary min-heap costs:",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      },
      {
        id: "q2",
        prompt: "To keep the K largest elements of a stream you maintain a:",
        options: ["Max-heap of size K", "Min-heap of size K", "Sorted array", "Trie"],
      },
      {
        id: "q3",
        prompt: "Building a heap from an unsorted array with heapify takes:",
        options: ["O(n)", "O(n log n)", "O(log n)", "O(n^2)"],
      },
    ],
  },
  {
    id: "dsa-graphs",
    title: "Graphs: BFS, DFS and Topological Sort",
    author: "freeCodeCamp",
    module: "Graphs",
    level: "Intermediate",
    minutes: 108,
    videoId: "tWVWeAqZ0WU",
    summary: "Representations, traversal orders, connected components and dependency ordering.",
    keyIdeas: [
      "BFS gives shortest paths in unweighted graphs",
      "Topological sort only exists for a DAG",
      "Adjacency lists cost O(V + E) space",
    ],
    quiz: [
      {
        id: "q1",
        prompt: "Shortest path in an unweighted graph is found with:",
        options: ["DFS", "BFS", "Dijkstra only", "Bellman-Ford only"],
      },
      {
        id: "q2",
        prompt: "A topological ordering exists only when the graph is:",
        options: ["Undirected", "Weighted", "A directed acyclic graph", "Complete"],
      },
      {
        id: "q3",
        prompt: "Traversing a graph stored as an adjacency list costs:",
        options: ["O(V)", "O(E)", "O(V + E)", "O(V * E)"],
      },
    ],
  },
  {
    id: "dsa-shortest-paths",
    title: "Dijkstra, Bellman-Ford and Union-Find",
    author: "William Fiset",
    module: "Graphs",
    level: "Advanced",
    minutes: 90,
    videoId: "pSqmAO-m7Lk",
    summary: "Weighted shortest paths, negative edges, and the disjoint-set trick behind Kruskal.",
    keyIdeas: [
      "Dijkstra assumes non-negative weights",
      "Bellman-Ford handles negative edges and detects negative cycles",
      "Union-find with path compression is near-constant per operation",
    ],
    quiz: [
      {
        id: "q1",
        prompt: "Dijkstra's algorithm breaks when the graph has:",
        options: ["Cycles", "Negative edge weights", "More than 1000 nodes", "Self loops"],
      },
      {
        id: "q2",
        prompt: "Bellman-Ford can additionally:",
        options: [
          "Detect negative cycles",
          "Run in O(1)",
          "Work only on trees",
          "Find maximum flow",
        ],
      },
      {
        id: "q3",
        prompt: "Union-find with path compression and union by rank is roughly:",
        options: ["O(1) amortised", "O(log n) always", "O(n)", "O(n log n)"],
      },
    ],
  },
  {
    id: "dsa-dp",
    title: "Dynamic Programming: Memo to Tabulation",
    author: "freeCodeCamp",
    module: "Dynamic programming",
    level: "Advanced",
    minutes: 300,
    videoId: "oBt53YbR9Kk",
    summary: "State design, transitions, and converting recursion into bottom-up tables.",
    keyIdeas: [
      "DP needs optimal substructure and overlapping subproblems",
      "Memoisation is top-down; tabulation is bottom-up",
      "Rolling arrays reduce space from O(n*m) to O(m)",
    ],
    quiz: [
      {
        id: "q1",
        prompt: "Dynamic programming requires which two properties?",
        options: [
          "Sorting and hashing",
          "Optimal substructure and overlapping subproblems",
          "Greedy choice and randomness",
          "Balanced trees and recursion",
        ],
      },
      {
        id: "q2",
        prompt: "Memoisation is best described as:",
        options: ["Bottom-up iteration", "Top-down recursion with caching", "Greedy pruning", "Backtracking"],
      },
      {
        id: "q3",
        prompt: "0/1 knapsack with n items and capacity W runs in:",
        options: ["O(n)", "O(n log W)", "O(n * W)", "O(2^n) only"],
      },
    ],
  },
  {
    id: "dsa-backtracking",
    title: "Recursion, Backtracking and Pruning",
    author: "CS Dojo",
    module: "Recursion",
    level: "Intermediate",
    minutes: 70,
    videoId: "B0NtAFf4bvU",
    summary: "N-Queens, subsets, permutations and how pruning turns exponential into feasible.",
    keyIdeas: [
      "Every backtracking solution is choose / explore / un-choose",
      "Subsets of n elements number 2^n",
      "Pruning invalid branches early is the whole game",
    ],
    quiz: [
      {
        id: "q1",
        prompt: "How many subsets does a set of n distinct elements have?",
        options: ["n", "n^2", "2^n", "n!"],
      },
      {
        id: "q2",
        prompt: "The backtracking template is:",
        options: [
          "Sort, scan, merge",
          "Choose, explore, un-choose",
          "Hash, compare, store",
          "Push, pop, peek",
        ],
      },
      {
        id: "q3",
        prompt: "Generating all permutations of n items costs at least:",
        options: ["O(n)", "O(n^2)", "O(2^n)", "O(n!)"],
      },
    ],
  },
  {
    id: "dsa-tries-strings",
    title: "Tries, String Matching and KMP",
    author: "freeCodeCamp",
    module: "Strings",
    level: "Advanced",
    minutes: 65,
    videoId: "GTJr8OvyEVQ",
    summary: "Prefix trees for autocomplete, plus linear-time pattern matching with KMP.",
    keyIdeas: [
      "Trie lookup is O(length of key), independent of dictionary size",
      "KMP builds a prefix-function to avoid re-scanning",
      "Rolling hashes give probabilistic O(n) matching",
    ],
    quiz: [
      {
        id: "q1",
        prompt: "Searching a word of length L in a trie costs:",
        options: ["O(1)", "O(L)", "O(n)", "O(n log n)"],
      },
      {
        id: "q2",
        prompt: "KMP achieves linear matching by precomputing:",
        options: ["A suffix array", "The prefix (failure) function", "A hash table", "A segment tree"],
      },
      {
        id: "q3",
        prompt: "Naive substring search of pattern m in text n is worst case:",
        options: ["O(n)", "O(n + m)", "O(n * m)", "O(log n)"],
      },
    ],
  },
];

export const DSA_MODULES = Array.from(new Set(DSA_LECTURES.map((l) => l.module)));

export function getDsaLecture(id: string): DsaLecture | undefined {
  return DSA_LECTURES.find((l) => l.id === id);
}
