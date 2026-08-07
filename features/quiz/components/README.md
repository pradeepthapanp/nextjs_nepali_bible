# Quiz — components + page orchestration (implemented)

The Quiz components/pages are fully implemented. Everything reuses the shared
design system (`LoadingState`/`ErrorState`/`EmptyState`, `Card`, `Label`,
`Button`, `PageContainer` + the feature-header convention, the shared
`useDialog` for the results dialog). The quiz routes are PUBLIC — **no
`AuthGate`** (Flutter pushes the quiz without an auth wrapper; the RPC is
anon-callable — probed).

## Reusable components (implemented)

| Component | Replaces (Flutter) | Responsibility |
| --- | --- | --- |
| `QuizOption` | the option row in `QuizPage.buildOption` | a presentational answer tile: the letter key (circle avatar), the option text, and after answering the correct (green + check) / wrong-selected (red + cancel) coloring |
| `QuizQuestionCard` | `QuizPage` question card + options + answer banner + explanation | one question + its `QuizOption`s + the after-answer Correct!/Wrong banner + the explanation card. The option statuses are derived here from the correct answer (no scoring duplicated) |
| `QuizProgress` | `QuizPage` `LinearProgressIndicator` + the Correct/Wrong chips | the progress bar + the live "Question X/Y" / Correct / Wrong readout (the play page computes the counts from its answers) |
| `QuizResultsDialog` | `QuizPage.showResultsDialog` | the score summary dialog: circular percent ring, Correct / Wrong counts, Play Again + Close — built on the SHARED `useDialog` (Escape, focus trap, scroll lock) + framer-motion (the Music/Maps dialog pattern); the Flutter dialog is `barrierDismissible: false` (only the buttons / Escape close it) |
| `QuizErrorState` | `_InitializeQuizPage` error state | thin wrapper over the shared `ErrorState` ("Failed to load questions" + retry) |

## Page orchestrators (implemented)

| Page | Replaces (Flutter) | Route |
| --- | --- | --- |
| `QuizHomePage` | `QuizHomePage` (`quiz_home.dart`) | `/quiz` (PUBLIC) |
| `QuizPlayPage` | `_InitializeQuizPage` + `QuizPage` (the pushed screen renders the fetched `QuizPage`) | `/quiz/play?…` (PUBLIC) |

- **`QuizHomePage`** — the "Bible Quiz" setup: Difficulty (Easy / Hard), Book
  (All Books / the 66-book list), Number of Questions (10 / 20 / 30) and
  Language (नेपाली) dropdowns + the Start Quiz button. Composes
  `useQuizNavigation` (`startQuiz(param)`) + the shared `Card`/`Label`/`Button`
  + native `<select>` dropdowns. The selections are local `useState` (Flutter
  widget state). **NOTE (faithful)**: no Bible version / Testament selector —
  not in the Flutter quiz (documented).
- **`QuizPlayPage`** — the `_InitializeQuizPage` + `QuizPage` port: reads the
  play setup from the URL (`useQuizNavigation().currentLink`), composes
  `useQuizQuestions(param)` → `LoadingState` ("Preparing Quiz…") →
  `QuizErrorState` / `EmptyState` ("No questions available for your selection",
  retry → refetch) → the play surface. The play surface holds TRANSIENT LOCAL
  state (currentIndex + an `answers` array indexed by question) — the Flutter
  `_QuizPageState` port — with **Previous / Next (a web refinement** — Flutter
  only moves forward; navigating back restores the saved selection + answered
  state), Finish (last question's Next → the results dialog), score computed
  from the answers, and Play Again (reset). **Orchestration only** — no
  Supabase / query logic here.

`AppHeader`/`AppFooter` (site chrome, placeholder nav) are NOT used on feature
pages (consistent with the other features).

## Route shells (implemented)

- `app/quiz/page.tsx` → `<Suspense><QuizHomePage/></Suspense>` (thin server
  shell; `Suspense` because `useQuizNavigation` reads `useSearchParams`).
- `app/quiz/play/page.tsx` → `<Suspense><QuizPlayPage/></Suspense>` (the play
  route reads its setup from the query string).
- **No dispatcher** — `/quiz` and `/quiz/play` are two explicit route shells
  (per the user's instruction).

## Reuse (nothing duplicated)

- States: shared `LoadingState` / `ErrorState` / `EmptyState`.
- Layout: shared `PageContainer` + the feature-header convention.
- Dialog: the shared `useDialog` lifecycle (the results dialog).
- The quiz does NOT reuse the Bible feature's selection components / deep-link
  helpers: it uses its OWN 1..66 book numbering (different from the web Bible's
  book codes) and questions have no bible-reference links — documented
  adaptations. No `@features/*` imports.
