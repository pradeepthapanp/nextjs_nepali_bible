import type { Reference } from "./reference";

/**
 * A bookmark/favorite — a user-pinned reference. Bookmarks are a
 * web/architecture-first capability (the Flutter app used playlist-based
 * favorites for music; Bible bookmarks are new here).
 */
export interface Bookmark {
  id: string;
  userId: string;
  reference: Reference;
  /** Optional label supplied by the user. */
  label?: string;
  createdAt: string;
}
