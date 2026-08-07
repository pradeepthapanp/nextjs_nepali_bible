/**
 * The Quiz feature barrel.
 *
 * Exposes every implemented layer: types, constants, the pure utils
 * (deep-link), the SERVICES (the data layer — `QuizService` + the aggregate),
 * the React Query layer (`quizKeys` + `useQuizQuestions`), the behavior hook
 * (`useQuizNavigation`) and the components + the page orchestrators. See
 * `README.md` for the full Flutter → Next mapping + the routes / deep links /
 * permissions + the verified RPC contract.
 */

export * from "./types";
export * from "./constants";
export * from "./utils";
export * from "./queries";
export * from "./services";
export * from "./hooks";
export * from "./components";
