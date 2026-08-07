# Quiz — React Query layer (implemented)

The Quiz query layer is fully implemented. `features/quiz/queries/` holds the
cache-key hierarchy + the single query hook (read-only feature: no mutations).

## Cache-key hierarchy (`query-keys.ts`)

`quizKeys.all` (`["quiz"]`) is the feature prefix; `quizKeys.questions(param)`
(`["quiz", "questions", param]`) is a question bank keyed by the FULL
`QuizParam` (the RPC selection params — difficulty / limit / bookNumber /
category / languageCode — are the cache key, so different quiz setups never
share a cache entry).

## Query hook (implemented)

| Hook | Cache key | Contract |
| --- | --- | --- |
| `useQuizQuestions(param)` | `quizKeys.questions(param)` | `useQuery({ queryKey: quizKeys.questions(param), queryFn: () => getQuizServices().quiz.getQuestions(param) })`. **PUBLIC — NO session guard** (Flutter's `quizQuestionsProvider` is a plain `FutureProvider.family`, no auth; the RPC is anon-callable — probed). `questions` is `QuizQuestion[] \| undefined` — the play page maps loading/error/empty off it. |

## Mutations

**NONE.** The quiz is read-only (questions are admin-seeded behind the RPC). No
mutation hooks exist.

## Refresh / caching strategy

- `refetch()` is wired to the Flutter error/empty retry
  (`ref.invalidate(quizQuestionsProvider(params))` in `_InitializeQuizPage`) —
  the `QuizPlayPage` error/empty states call `useQuizQuestions(param).refetch()`.
- `staleTime` is left at the default — each `/quiz/play` visit builds a fresh
  `QuizParam`-keyed query (the RPC returns RANDOM questions; caching is
  per-setup and the play is a one-shot flow).

## Reuse (nothing duplicated)

- The service call goes through `getQuizServices()` (the memoized
  `QuizServices` singleton).
- No `@features/*` imports; no direct `supabase`; the shared `unwrap` is used
  in the service layer (not here).
