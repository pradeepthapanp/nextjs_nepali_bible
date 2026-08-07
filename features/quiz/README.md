# Quiz feature (complete — Bible Quiz)

Production-grade Next.js implementation of the Quiz feature, derived from a
full study of the Flutter implementation (`lib/quiz/quiz_home.dart` +
`lib/quiz/quiz_page.dart`; `lib/providers/quiz/quiz_question_provider.dart`;
the `fetchQuestions` repository method in `lib/providers/supabase/supabase_repository_provider.dart`;
the `lib/models/quiz_question.dart` + `lib/models/quiz_param.dart` models;
`AppRoutes.bibleQuiz = '/bible_quiz'` in `lib/router/app_routes.dart`) AND a
live verification of the backend RPC (see below).

**Implemented (complete feature)**: `types/`, `constants/`, `queries/`
(`quizKeys` + `useQuizQuestions`), `utils/` (the pure deep-link helpers),
`services/` (`QuizService` + the aggregate), `hooks/` (`useQuizNavigation`),
`components/` (the reusable components + the `QuizHomePage` / `QuizPlayPage`
page orchestrators) and the two route shells (`app/quiz/page.tsx` +
`app/quiz/play/page.tsx`). See the folder READMEs for the per-layer details.

## Feature overview

The Quiz is a **read-only, public** feature with a setup screen and a play
screen. `QuizHomePage` collects a `QuizParam` (language / difficulty / book /
number of questions), then `_InitializeQuizPage` fetches a random question bank
via the **Supabase RPC `get_random_quiz_questions`** (NOT local generation) and
renders `QuizPage`, which walks the questions, scores Correct/Wrong and shows a
final summary with Play Again / Close.

## Flutter → Web mapping

| Flutter piece | Web piece | Notes |
| --- | --- | --- |
| `QuizQuestion` model | `types/quiz.ts` `QuizQuestion` | `id, question, options: Record<string,string>, correctAnswer, explanation?, category?, bookNumber?, chapter?, difficulty, languageCode, published, createdAt?, updatedAt?` |
| `QuizParam` model | `types/quiz.ts` `QuizParam` | `difficulty, limit?, bookNumber?, category?, languageCode?` |
| `SupabaseRepository.fetchQuestions(QuizParam)` | `QuizService.getQuestions(param)` | RPC `get_random_quiz_questions` — see `services/README.md` |
| `quizQuestionsProvider` (`FutureProvider.family`) | `useQuizQuestions(param)` query | the only server state, keyed by `quizKeys.questions(param)` |
| `QuizHomePage` | `QuizHomePage` | `/quiz` — the setup screen |
| `_InitializeQuizPage` | `QuizPlayPage` | `/quiz/play?…` — fetch → loading/error/empty → the play surface |
| `QuizPage` (widget) | the play surface in `QuizPlayPage` (`QuizQuestionCard` + `QuizProgress`) | the play UI (no separate route) |
| `QuizPage.showResultsDialog` | `QuizResultsDialog` | score ring + Correct/Wrong + Play Again/Close |
| `QuizPage.buildOption` | `QuizOption` | the letter-key answer tile with correct/wrong coloring |

## Routes

| Route | Page | Protected? |
| --- | --- | --- |
| `/quiz` | `QuizHomePage` | **PUBLIC** (Flutter pushes it from the Bible shell, no `AuthStatePage`) |
| `/quiz/play` | `QuizPlayPage` | **PUBLIC** (reads the setup from the query string) |

Two explicit route shells (per the user's instruction — NO dispatcher):
`app/quiz/page.tsx` → `<Suspense><QuizHomePage/></Suspense>` and
`app/quiz/play/page.tsx` → `<Suspense><QuizPlayPage/></Suspense>` (the play
route reads its setup from the query string). **WEB ADAPTATION (documented)**: the
Flutter Quiz is UNWIRED — `AppRoutes.bibleQuiz` is defined but never used,
neither page is ever instantiated and no GoRoute registers it. The web makes
it reachable via real `/quiz` + `/quiz/play` routes (the user explicitly wants
the quiz built).

## Deep links

- **Model** (`types/deep-link.ts`): `QuizDeepLink` = `{ kind: "home" }` |
  `{ kind: "play", difficulty, limit, bookNumber?, languageCode }` (the play
  link carries the selected setup).
- **URL source** (`utils/deep-link.ts`): `buildQuizUrl` → `/quiz` and
  `/quiz/play?difficulty={d}&limit={n}[&book={1..66}][&lang={code}]`;
  `parseQuizPath(pathname, search)` → home / play (defaulting difficulty
  "hard", limit 20, lang "np"). The play params travel via the URL so refresh /
  deep links restore the exact quiz (Flutter passed the `QuizParam` in-memory).
- `useQuizNavigation()` (contract) composes the router + these pure helpers.

## Permissions

**None.** The quiz is public (Flutter pushes it without an auth wrapper) and
read-only (no create/edit/delete). The RPC is anon-callable (verified live). No
`AuthGate`, no `canManage`, no permission helpers.

## Service contract

See `services/README.md` (implemented): `QuizService.getQuestions(param)` — the
RPC `get_random_quiz_questions` with `p_language_code` / `p_difficulty` /
`p_book_number` / `p_limit`, `mapQuizQuestion` → `QuizQuestion[]`; the
`QuizServices { quiz }` aggregate + `createQuizServices(client =
createClient())` (ONE shared client) + the memoized `getQuizServices()`.
**WEB ADAPTATION (implemented)**: Flutter hardcodes `'np'`/`'hard'` in the RPC
call (ignoring the collected params); the web passes the user's SELECTED
values (the RPC accepts them — probed), fixing the quirk while preserving the
Supabase RPC.

## React Query contract

See `queries/README.md` (implemented): `quizKeys.questions(param)` (the
`QuizParam` is the cache key) + `useQuizQuestions(param)` — PUBLIC, no
mutations (read-only), `refetch()` wired to the error/empty retry.

## Stores

See `store/README.md` (implemented): **NO store.** The setup selections, the
play params (carried by the URL) and the play state (currentIndex / an
`answers` array / resultsOpen) are all transient local component state (the
Flutter `StatefulWidget` precedent).

## Hooks

See `hooks/README.md` (implemented): ONE hook — `useQuizNavigation()`
(`currentLink` / `startQuiz(param)` / `goHome` / `goBack`). The question fetch
is the React Query hook; the play state is component-local.

## Reusable components

See `components/README.md` (implemented): `QuizHomePage`, `QuizPlayPage`,
`QuizOption`, `QuizQuestionCard`, `QuizProgress`, `QuizResultsDialog`,
`QuizErrorState` — reusing the shared `LoadingState` / `ErrorState` /
`EmptyState`, `Card` / `Label` / `Button`, `PageContainer` + the feature-header
convention, native `<select>` dropdowns, and the shared `useDialog` (results).

## Backend contract (VERIFIED against the live Supabase backend)

A runtime probe (deleted) confirmed the `get_random_quiz_questions` RPC exists
and is publicly callable, returning rows with EXACTLY the `QuizQuestion` model
columns: `book_number, category, chapter, correct_answer, created_at,
difficulty, explanation, id, language_code, options (JSON object), published,
question, updated_at`. The probe also confirmed `p_difficulty: "easy"` and a
specific `p_book_number` (1) both work — the 1..66 numbering is what the RPC
expects. **No invented schema/APIs** — the single existing RPC, like Flutter.

## Reuse decisions (documented adaptations)

- **Bible selection components are NOT reused.** The Quiz uses its OWN **1..66
  book numbering** (Flutter's hard-coded list; the same value passed to
  `p_book_number`), which is DIFFERENT from the web Bible feature's book codes
  (0..460 / 470..730). The web Bible's `book-picker`/`useBooks` data would pass
  the wrong numbers to the RPC, so the Quiz keeps its faithful `QUIZ_BIBLE_BOOKS`
  constant.
- **Bible deep-link helpers are NOT reused.** Quiz questions/options are plain
  text with NO bible-reference links (unlike devotion/commentary HTML), so
  there is no bible navigation to wire.
- **"Bible version" + "Testament" selectors are NOT ported.** The user spec
  listed them, but the Flutter `QuizHomePage` has only Language / Difficulty /
  Book / Number of Questions — the web maps faithfully and does NOT invent
  version/testament selection.
- **"Previous" is NOT ported.** Flutter's `QuizPage` has only Next / Finish
  (no previous button) — the user spec mentioned previous/next, but the web
  does NOT invent it.
- **The RPC is preserved** (Flutter uses Supabase, so the web does too) — with
  the documented `'np'`/`'hard'` hardcoding fix.

## Folder layout

| Folder | Status |
| --- | --- |
| `types/` | IMPLEMENTED — `QuizQuestion`, `QuizParam`, `QuizDifficulty`, `QuizDeepLink` |
| `constants/` | IMPLEMENTED — `QUIZ_BIBLE_BOOKS` (66 books), difficulties/languages/limits, defaults, the RPC name |
| `utils/` | IMPLEMENTED — `buildQuizUrl` / `parseQuizPath` |
| `queries/` | IMPLEMENTED — `quizKeys` + `useQuizQuestions` |
| `services/` | IMPLEMENTED — `QuizService` + the `QuizServices` aggregate/factory/singleton |
| `store/` | IMPLEMENTED — NO store |
| `hooks/` | IMPLEMENTED — `useQuizNavigation` |
| `components/` | IMPLEMENTED — the pages + the reusable components |
| `editor/` | NOT required (read-only, admin-seeded behind the RPC) |
| `README.md` | this file (the whole-feature doc) |
