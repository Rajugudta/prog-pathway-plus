/**
 * Server-only quiz answer key. Never imported by client code, so answers
 * cannot be read out of the browser bundle or the network response.
 */
export const QUIZ_ANSWERS: Record<string, number[]> = {
  "dsa-complexity": [2, 1, 0],
  "dsa-arrays": [0, 1, 1],
  "dsa-linkedlist": [0, 2, 1],
  "dsa-stacks-queues": [1, 0, 1],
  "dsa-hashing": [0, 1, 1],
  "dsa-trees": [1, 1, 2],
  "dsa-heaps": [1, 1, 0],
  "dsa-graphs": [1, 2, 2],
  "dsa-shortest-paths": [1, 0, 0],
  "dsa-dp": [1, 1, 2],
  "dsa-backtracking": [2, 1, 3],
  "dsa-tries-strings": [1, 1, 2],
};

export const QUIZ_PASS_RATIO = 0.67;
