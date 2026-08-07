/**
 * Quiz cache-key hierarchy — the ONLY place the React Query cache keys for
 * the Quiz feature are defined (the counterparts to `devotionKeys`,
 * `communityKeys`, `authKeys`).
 *
 *   quizKeys.all          ["quiz"]                   — feature prefix
 *   quizKeys.questions(p) ["quiz", "questions", p]   — a question bank (per
 *                                                       QuizParam — the RPC
 *                                                       selection params are
 *                                                       the key)
 *
 * The SESSION is not a key (the `SupabaseProvider` owns it). No per-user key
 * is needed: the quiz is public (the RPC is anon-callable — probed) and the
 * question bank depends ONLY on the `QuizParam` (difficulty / limit / book /
 * language).
 */
import type { QuizParam } from "../types";

export const quizKeys = {
  all: ["quiz"] as const,
  questions: (param: QuizParam) =>
    ["quiz", "questions", param] as const,
};
