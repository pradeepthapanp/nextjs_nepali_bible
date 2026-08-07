/**
 * Quiz deep-link helpers — the ONLY place the Quiz URLs are built and parsed
 * (the counterparts to `buildCommunityUrl`/`parseCommunityPath`). Pure +
 * framework-free so they are directly unit-testable.
 *
 *   home → /quiz
 *   play → /quiz/play?difficulty={d}&limit={n}[&book={1..66}][&lang={code}]
 *
 * The PLAY route carries the selected setup in the query string so browser
 * refresh / deep links restore the exact quiz (Flutter passed the `QuizParam`
 * to the pushed `_InitializeQuizPage` in-memory; the web URL keeps it).
 */
import {
  QUIZ_DEFAULT_DIFFICULTY,
  QUIZ_DEFAULT_LANGUAGE,
  QUIZ_DEFAULT_LIMIT,
} from "../constants";
import type { QuizDeepLink } from "../types";
import type { QuizDifficulty } from "../types";

/** Builds the URL for a quiz deep link. */
export function buildQuizUrl(link: QuizDeepLink): string {
  if (link.kind === "home") return "/quiz";
  const params = new URLSearchParams();
  params.set("difficulty", link.difficulty);
  params.set("limit", String(link.limit));
  if (link.bookNumber !== undefined) params.set("book", String(link.bookNumber));
  params.set("lang", link.languageCode);
  return `/quiz/play?${params.toString()}`;
}

/** Parses a URL (pathname + search) into a quiz deep link, or null off-section. */
export function parseQuizPath(
  pathname: string,
  search: string,
): QuizDeepLink | null {
  if (pathname === "/quiz") return { kind: "home" };
  if (pathname !== "/quiz/play") return null;
  const params = new URLSearchParams(search);
  const difficultyRaw = params.get("difficulty");
  const difficulty: QuizDifficulty =
    difficultyRaw === "easy" || difficultyRaw === "hard"
      ? difficultyRaw
      : QUIZ_DEFAULT_DIFFICULTY;
  const limitRaw = Number(params.get("limit"));
  const bookRaw = params.get("book");
  return {
    kind: "play",
    difficulty,
    limit: Number.isInteger(limitRaw) && limitRaw > 0 ? limitRaw : QUIZ_DEFAULT_LIMIT,
    bookNumber: bookRaw ? Number(bookRaw) : undefined,
    languageCode: params.get("lang") ?? QUIZ_DEFAULT_LANGUAGE,
  };
}
