/**
 * React Query cache keys for the Community feature — the cache-key hierarchy
 * used by the query/mutation hooks.
 *
 *   Prayers (`prayers` table):
 *     - `lists()` / `infinite()`  — the paginated list (Flutter loadMore).
 *     - `detail(id)`              — getPrayer (WEB-FIRST, the detail deep link).
 *     - `count(id)`               — getPrayerCount (WEB-FIRST column read).
 *     - `replies(prayerId)`       — the prayer_replies (comments) list.
 *     - `hasPrayed(userId, id)`   — the prayer_prays membership (per-USER, so a
 *                                   second signed-in user never sees another
 *                                   user's stale membership — the same reason
 *                                   the auth profile key is per-user).
 *   Notices (`notices` table):
 *     - `lists()` / `infinite()`  — the paginated list (Flutter loadMore).
 *     - `detail(id)`              — getNotice (WEB-FIRST, the detail deep link).
 *   Community-wide:
 *     - `profile(userId)`         — a profile by user id (the current user's
 *                                   role for permissions + public author
 *                                   profiles), fetched via the SHARED
 *                                   ProfileService. ONE key for both
 *                                   sub-features (no duplicate cache slots).
 *
 * The SESSION is NOT a query key — it lives in the existing `SupabaseProvider`
 * (the one auth source, via the Authentication feature).
 */
export const prayerKeys = {
  all: () => ["community", "prayers"] as const,
  lists: () => [...prayerKeys.all(), "list"] as const,
  infinite: () => [...prayerKeys.lists(), "infinite"] as const,
  detail: (id: string) => [...prayerKeys.all(), "detail", id] as const,
  count: (id: string) => [...prayerKeys.all(), "count", id] as const,
  replies: (prayerId: string) =>
    [...prayerKeys.all(), "replies", prayerId] as const,
  hasPrayed: (userId: string, prayerId: string) =>
    [...prayerKeys.all(), "has-prayed", userId, prayerId] as const,
};

export const noticeKeys = {
  all: () => ["community", "notices"] as const,
  lists: () => [...noticeKeys.all(), "list"] as const,
  infinite: () => [...noticeKeys.lists(), "infinite"] as const,
  detail: (id: string) => [...noticeKeys.all(), "detail", id] as const,
};

/** All community cache keys (the shared scope: profiles, etc.). */
export const communityKeys = {
  all: () => ["community"] as const,
  profile: (userId: string) =>
    [...communityKeys.all(), "profile", userId] as const,
};
