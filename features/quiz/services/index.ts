/**
 * Barrel for the Quiz service layer.
 *
 *   quiz-service.ts  QuizService + mapQuizQuestion + QuizQuestionRow
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { QuizService } from "./quiz-service";

export { QuizService, mapQuizQuestion, type QuizQuestionRow } from "./quiz-service";

/** The Quiz service aggregate. */
export interface QuizServices {
  quiz: QuizService;
}

/** Builds the Quiz services on ONE shared `@supabase/ssr` browser client. */
export function createQuizServices(
  client: SupabaseClient = createClient(),
): QuizServices {
  return { quiz: new QuizService(client) };
}

let singleton: QuizServices | undefined;

/** The memoized Quiz services singleton. */
export function getQuizServices(): QuizServices {
  if (!singleton) singleton = createQuizServices();
  return singleton;
}
