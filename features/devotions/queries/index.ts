/**
 * Barrel for the Devotions React Query layer — the cache-key hierarchy + the
 * query hook (read-only feature: no mutation hooks).
 *
 *   query-keys.ts        devotionKeys — { all, daily }
 *   use-daily-devotion.ts useDailyDevotion (today's devotion)
 */

export * from "./query-keys";
export * from "./use-daily-devotion";
