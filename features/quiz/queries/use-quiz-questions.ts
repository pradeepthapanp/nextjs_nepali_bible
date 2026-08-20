"use client";

import { useQuery } from "@tanstack/react-query";
import { getQuizServices } from "../services";
import { quizKeys } from "./query-keys";
import type { QuizParam } from "../types";

/**
 * useQuizQuestions — the question bank for a `QuizParam` (the web replacement
 * of Flutter `quizQuestionsProvider` in
 * `providers/quiz/quiz_question_provider.dart`).
 *
 * PUBLIC — NO session guard (Flutter's provider is a plain
 * `FutureProvider.family`, no auth; the RPC is anon-callable — probed). The
 * full `QuizParam` is the cache key, so different quiz setups never share a
 * cache entry. `questions` is `QuizQuestion[] | undefined` — the play page
 * maps loading/error/empty off it (Flutter `_InitializeQuizPage`).
 */
export function useQuizQuestions(param: QuizParam) {
  return useQuery({
    queryKey: quizKeys.questions(param),
    queryFn: () => getQuizServices().quiz.getQuestions(param),
  });
}

/**
 * Whether PUBLISHED quiz questions exist for a book (1..66 canonical) —
 * WEB-FIRST internal-linking check: the Bible reader only surfaces a
 * "Bible quiz" link when the book actually has questions (never invented).
 * Disabled until a book number is known.
 */
export function useQuizBookHasQuestions(bookNumber?: number) {
  return useQuery({
    queryKey: quizKeys.hasQuestions(bookNumber ?? 0),
    queryFn: () =>
      getQuizServices().quiz.hasQuestionsForBook(bookNumber as number),
    enabled: Boolean(bookNumber),
  });
}
