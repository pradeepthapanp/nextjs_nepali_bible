/**
 * Barrel for the Quiz React Query layer — the cache-key hierarchy + the query
 * hook (read-only feature: no mutation hooks).
 *
 *   query-keys.ts          quizKeys — { all, questions(param) }
 *   use-quiz-questions.ts  useQuizQuestions(param)
 */

export * from "./query-keys";
export * from "./use-quiz-questions";
