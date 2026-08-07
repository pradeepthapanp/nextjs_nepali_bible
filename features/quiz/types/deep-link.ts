/**
 * Quiz deep-link types — the typed navigation targets for the Quiz feature
 * (the counterparts to `CommunityDeepLink` / `DevotionDeepLink`).
 *
 *   home → /quiz
 *   play → /quiz/play?difficulty={d}&limit={n}[&book={1..66}][&lang={code}]
 *
 * Flutter pushes `QuizHomePage` then `_InitializeQuizPage` (which fetches and
 * shows `QuizPage`) — but the whole feature is UNWIRED in Flutter
 * (`AppRoutes.bibleQuiz = '/bible_quiz'` is defined and never used; neither
 * page is ever instantiated; no GoRoute). The web makes it reachable via a
 * real `/quiz` route (a documented web adaptation — the user explicitly wants
 * the quiz built). The PLAY params travel via the URL query so refresh /
 * deep links restore the selected quiz setup.
 */
import type { QuizDifficulty } from "./quiz";

export type QuizDeepLink =
  | { kind: "home" }
  | {
      kind: "play";
      difficulty: QuizDifficulty;
      limit: number;
      /** 1..66 book number, or undefined for "All Books". */
      bookNumber?: number;
      languageCode: string;
    };
