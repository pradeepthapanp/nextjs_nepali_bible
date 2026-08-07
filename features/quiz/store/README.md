# Quiz — store (implemented: NO store)

The Quiz store layer is fully implemented with **NO Zustand store** — every
piece of quiz state is either transient local component state or carried by the
URL (the auth-forms precedent).

| State | Lives in | Why (faithful to Flutter) |
| --- | --- | --- |
| The setup selections (language / difficulty / book / questions) | `QuizHomePage` local `useState` | Flutter `_QuizHomePageState` fields are widget-local |
| The play params between home → play | the URL query (`/quiz/play?…`) | the web replaces Flutter's in-memory `QuizParam` push with a deep-link URL (refresh/deep-link safe) |
| The play state (currentIndex / answers / resultsOpen) | `QuizPlayPage` local `useState` | Flutter `_QuizPageState` fields are widget-local; "Play Again" resets them in the same component |

## Explicitly NO stores

- **NO session store** — the `SupabaseProvider` owns the session (and the quiz
  is public anyway).
- **NO question-bank cache store** — React Query owns the server state
  (`quizKeys.questions(param)`).
- **NO play/composer store** — the quiz is a self-contained component flow.
