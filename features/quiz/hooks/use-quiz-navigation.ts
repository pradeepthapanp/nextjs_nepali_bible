"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { QUIZ_DEFAULT_LANGUAGE, QUIZ_DEFAULT_LIMIT } from "../constants";
import { buildQuizUrl, parseQuizPath } from "../utils";
import type { QuizParam } from "../types";

/**
 * useQuizNavigation — the Quiz deep-link + navigation behavior (the web port
 * of Flutter's `Navigator.push(_InitializeQuizPage(params: param))`).
 *
 * COMPOSES the Next router + the pure `buildQuizUrl`/`parseQuizPath` helpers
 * (the single URL source in `utils/deep-link.ts`). `startQuiz(param)` pushes
 * the play route carrying the setup in the query string (so refresh / deep
 * links restore the exact quiz); `currentLink` reads the current path +
 * search back into a `QuizDeepLink`.
 */
export function useQuizNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /** The parsed quiz deep link of the current path (+ search). */
  const currentLink = useMemo(
    () => parseQuizPath(pathname, searchParams.toString()),
    [pathname, searchParams],
  );

  /** Starts a quiz: pushes `/quiz/play?…` with the selected setup. */
  const startQuiz = useCallback(
    (param: QuizParam) => {
      router.push(
        buildQuizUrl({
          kind: "play",
          difficulty: param.difficulty,
          limit: param.limit ?? QUIZ_DEFAULT_LIMIT,
          bookNumber: param.bookNumber,
          languageCode: param.languageCode ?? QUIZ_DEFAULT_LANGUAGE,
        }),
      );
    },
    [router],
  );

  /** Goes home (the "Close" results action, Flutter `Navigator.pop`). */
  const goHome = useCallback(() => router.push("/quiz"), [router]);

  /** Goes back when there is history, else the quiz home. */
  const goBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.replace("/quiz");
    }
  }, [router]);

  return { currentLink, startQuiz, goHome, goBack };
}
