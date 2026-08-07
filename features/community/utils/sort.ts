/**
 * Community pure sort helpers — a port of Flutter's `NoticesNotifier.sortNotices`
 * (`notices_provider.dart`). Returns a NEW array (the React Query cache must
 * never be mutated in place — the same lesson as the Music `artistSort`).
 */
import type { Notice, NoticeSort } from "../types";

/** Sorts a notice list by the Flutter `NoticeSort` rules. */
export function sortNotices<T extends Notice>(
  notices: T[],
  sort: NoticeSort,
): T[] {
  const sorted = [...notices];
  switch (sort) {
    case "newest":
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "oldest":
      sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      break;
    case "alphabetical":
      sorted.sort((a, b) =>
        a.title.toLowerCase().localeCompare(b.title.toLowerCase()),
      );
      break;
  }
  return sorted;
}

/** The "My Notices" client filter (Flutter `_NoticeList`: `userId == mine`). */
export function isOwnNotice<T extends Notice>(
  notice: T,
  currentUserId: string | undefined,
): boolean {
  return Boolean(currentUserId && notice.userId === currentUserId);
}
