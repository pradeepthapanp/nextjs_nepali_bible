# Quiz — services data layer (implemented)

The Quiz data layer is fully implemented. `features/quiz/services/` holds
`QuizService` + the aggregate + the factory/singleton.

## Flutter repository → service mapping

| Flutter repository method | Web service method | Notes |
| --- | --- | --- |
| `SupabaseRepository.fetchQuestions(QuizParam)` | `QuizService.getQuestions(param)` | the RPC `get_random_quiz_questions` → `QuizQuestion[]` |

## Service contract (implemented)

### `QuizService` (the `get_random_quiz_questions` RPC — READ-ONLY)

- `getQuestions(param: QuizParam): Promise<QuizQuestion[]>` — calls the RPC
  with the FOUR params built from the `QuizParam` (`QUIZ_RPC_NAME`):
  - `p_language_code` ← `param.languageCode ?? QUIZ_DEFAULT_LANGUAGE`
  - `p_difficulty` ← `param.difficulty`
  - `p_book_number` ← `param.bookNumber ?? null` (null = All Books)
  - `p_limit` ← `param.limit ?? QUIZ_RPC_DEFAULT_LIMIT`
  then `unwrap` (the SHARED `@/services/helpers`) + `mapQuizQuestion` → array.
  Uses the shared `createClient` (`@/lib/supabase/client`, `@supabase/ssr`).
- Mapper `mapQuizQuestion` + `QuizQuestionRow` exported. `options` (JSON object)
  → `Record<string, string>`; `correct_answer` → `correctAnswer` (the option KEY).
- **WEB ADAPTATION (implemented)**: Flutter's `fetchQuestions` HARDCODES
  `p_language_code: 'np'` and `p_difficulty: 'hard'` (it IGNORES the collected
  `QuizParam` values). The web passes the user's SELECTED values (the RPC
  accepts them — probed), fixing the Flutter quirk while preserving the
  Supabase RPC behavior.
- **NO other methods**: no list, no create/edit/delete (read-only,
  admin-seeded behind the RPC).

### Aggregate + singleton (the factory convention)

- `QuizServices { quiz }` — one aggregate exposing the service.
- `createQuizServices(client = createClient())` — ONE shared `@supabase/ssr`
  browser client (quiz is the only consumer).
- `getQuizServices()` — the memoized singleton.

No session, profile or upload service is needed (public, read-only).

## Backend contract (VERIFIED against the live Supabase backend)

A runtime probe (deleted) confirmed the `get_random_quiz_questions` RPC exists
and is publicly callable, returning rows with EXACTLY the `QuizQuestion` model
columns: `book_number, category, chapter, correct_answer, created_at,
difficulty, explanation, id, language_code, options (JSON object), published,
question, updated_at`. `p_difficulty: "easy"` + `p_book_number: 1` both work
(the 1..66 numbering is what the RPC expects). **No invented schema/APIs** —
the single existing RPC, like Flutter.
