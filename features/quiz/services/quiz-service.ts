import type { SupabaseClient } from "@supabase/supabase-js";
import { unwrap } from "@/services/helpers";
import {
  QUIZ_DEFAULT_LANGUAGE,
  QUIZ_RPC_DEFAULT_LIMIT,
  QUIZ_RPC_NAME,
} from "../constants";
import type { QuizParam, QuizQuestion } from "../types";

/** A raw `get_random_quiz_questions` RPC row (snake_case, the mapped shape
 * before domain conversion). Columns VERIFIED against the live backend. */
export interface QuizQuestionRow {
  id: string;
  question: string;
  options: Record<string, string>;
  correct_answer: string;
  explanation: string | null;
  category: string | null;
  book_number: number | null;
  chapter: number | null;
  difficulty: string;
  language_code: string;
  published: boolean;
  created_at: string | null;
  updated_at: string | null;
}

/** Maps a raw RPC row to the domain `QuizQuestion` (snake_case → camelCase). */
export function mapQuizQuestion(row: QuizQuestionRow): QuizQuestion {
  return {
    id: row.id,
    question: row.question,
    options: row.options,
    correctAnswer: row.correct_answer,
    explanation: row.explanation ?? undefined,
    category: row.category ?? undefined,
    bookNumber: row.book_number ?? undefined,
    chapter: row.chapter ?? undefined,
    difficulty: row.difficulty,
    languageCode: row.language_code,
    published: row.published,
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  };
}

/**
 * QuizService — the data layer for the `get_random_quiz_questions` RPC
 * (READ-ONLY). Ports `SupabaseRepository.fetchQuestions`
 * (`lib/providers/supabase/supabase_repository_provider.dart`).
 *
 * WEB ADAPTATION (documented): Flutter's `fetchQuestions` HARDCODES
 * `p_language_code: 'np'` and `p_difficulty: 'hard'` (it ignores the collected
 * `QuizParam` values). This service passes the user's SELECTED values (the RPC
 * accepts them — probed), fixing the Flutter quirk while preserving the
 * Supabase RPC behavior.
 */
export class QuizService {
  constructor(private readonly client: SupabaseClient) {}

  /** Fetches a random question bank for the selection. */
  async getQuestions(param: QuizParam): Promise<QuizQuestion[]> {
    const response = await this.client.rpc(QUIZ_RPC_NAME, {
      p_language_code: param.languageCode ?? QUIZ_DEFAULT_LANGUAGE,
      p_difficulty: param.difficulty,
      p_book_number: param.bookNumber ?? null,
      p_limit: param.limit ?? QUIZ_RPC_DEFAULT_LIMIT,
    });
    const rows = unwrap<QuizQuestionRow[]>(response) as QuizQuestionRow[] | null;
    return (rows ?? []).map(mapQuizQuestion);
  }
}
