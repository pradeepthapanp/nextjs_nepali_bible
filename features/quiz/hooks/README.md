# Quiz — behavior hooks (implemented)

The Quiz hooks are fully implemented with ONE behavior hook —
`useQuizNavigation` (the deep-link + navigation behavior). The question fetch
is the React Query hook (`useQuizQuestions`), and the play state is transient
local component state (no hook).

## Hook (implemented)

| Hook | Composes | Contract |
| --- | --- | --- |
| `useQuizNavigation()` | `useRouter` / `usePathname` / `useSearchParams` + the pure `buildQuizUrl` / `parseQuizPath` | `{ currentLink, startQuiz(param), goHome, goBack }` — `currentLink` = `parseQuizPath(pathname, search)` (the play route reads its setup from the query); `startQuiz(param)` → `router.push(buildQuizUrl({ kind: "play", … }))` (the web port of Flutter's `Navigator.push(_InitializeQuizPage(params))`); `goHome` → `/quiz`; `goBack` → history back else `/quiz` (the results "Close" + the header back). |

## Explicitly NOT hooks

- `useQuizQuestions` is the REACT QUERY hook (lives in `queries/`, composed by
  `QuizPlayPage` — no duplicate behavior wrapper).
- The play state is component-local (`QuizPlayPage` `useState` — the Flutter
  `StatefulWidget` precedent), not a hook.
- No share / reader-settings hooks — the quiz has no share action and no HTML
  content body (questions are plain text).

## Reuse (nothing duplicated)

- The query goes through `getQuizServices()`.
- No `@features/*` imports; no direct Supabase; no duplicated deep-link logic
  (all in `utils/deep-link.ts`).
