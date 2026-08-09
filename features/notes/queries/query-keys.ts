/**
 * Central React Query cache keys for the Notes feature. Notes are a flat
 * user-owned list (no pagination — Flutter fetches all), so the keys are
 * simple: a list family + per-note detail. `lists()` is the single key the
 * mutations update/invalidate.
 */
export const noteKeys = {
  all: ["notes"] as const,
  lists: () => [...noteKeys.all, "lists"] as const,
  detail: (id: string) => [...noteKeys.all, "detail", id] as const,
};
