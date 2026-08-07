/**
 * React Query cache keys for Online Songs (mirrors the `musicKeys` pattern).
 *
 * `infinite()` is the paginated library list; `detail(id)` the single audio
 * used by the edit page; `categories()` the distinct category values. The
 * current user's profile is keyed by user id.
 */
export const songsKeys = {
  all: () => ["songs"] as const,
  lists: () => ["songs", "list"] as const,
  infinite: () => ["songs", "list", "infinite"] as const,
  detail: (id: string) => ["songs", "detail", id] as const,
  categories: () => ["songs", "categories"] as const,
  profile: (userId: string) => ["songs", "profile", userId] as const,
};
