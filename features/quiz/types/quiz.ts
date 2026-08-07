/**
 * Quiz domain types — direct ports of the Flutter `QuizQuestion` model
 * (`lib/models/quiz_question.dart`) and `QuizParam` model
 * (`lib/models/quiz_param.dart`), following the web convention (snake_case
 * rows → camelCase domain, ISO string dates).
 *
 * The RPC `get_random_quiz_questions` return shape was VERIFIED against the
 * live backend (see `services/README.md`) — exactly these columns, `options`
 * being a JSON object.
 */

/** The selectable difficulty options (Flutter `QuizHomePage` difficulty
 * dropdown: Easy / Hard). The `QuizQuestion.difficulty` MODEL field is a
 * plain string (Flutter types it `String`, default `'easy'`); this union is
 * the UI/param selection. */
export type QuizDifficulty = "easy" | "hard";

/** A quiz question (a `get_random_quiz_questions` RPC row). */
export interface QuizQuestion {
  id: string;
  /** The question text. */
  question: string;
  /** The answer choices — a JSON object `{ A: text, B: text, ... }`
   * (Flutter `Map<String, String>`). */
  options: Record<string, string>;
  /** The KEY of the correct option (e.g. `"A"`), not the text. */
  correctAnswer: string;
  explanation?: string;
  category?: string;
  /** The quiz's 1..66 book number (see the 1..66 numbering note in the
   * README — NOT the web Bible feature's book codes). */
  bookNumber?: number;
  chapter?: number;
  /** The model field is a plain string (Flutter default `'easy'`). */
  difficulty: string;
  languageCode: string;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** The question-fetch parameters (Flutter `QuizParam`) — the EXACT shape the
 * RPC params are built from. */
export interface QuizParam {
  /** The UI difficulty selection (easy | hard). */
  difficulty: QuizDifficulty;
  /** Number of questions (Flutter `_limit`, options 10/20/30; the RPC
   * defaults to 30 when null). */
  limit?: number;
  /** The 1..66 quiz book number (null = "All Books"). */
  bookNumber?: number;
  category?: string;
  languageCode?: string;
}
