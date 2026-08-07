/**
 * Devotion cache-key hierarchy — the ONLY place the React Query cache keys
 * for the Devotions feature are defined (the counterparts to `mapKeys`,
 * `articleKeys`, `prayerKeys`, `authKeys`).
 *
 * The devotion is a SINGLE public read (today's devotion) — there is no list,
 * no detail-by-id surface and no session, so the hierarchy is minimal:
 *
 *   devotionKeys.all    ["devotions"]               — feature prefix
 *   devotionKeys.daily  ["devotions", "daily"]      — today's devotion
 *
 * The SESSION is not a key (the `SupabaseProvider` owns it). No per-user key
 * is needed: the devotion is public (no auth gate) and identical for everyone.
 */

export const devotionKeys = {
  all: ["devotions"] as const,
  daily: ["devotions", "daily"] as const,
};
