import type { Bookmark, Reference } from "../types";
import { requiresTable } from "./helpers";

/**
 * Bookmark/favorite service.
 *
 * NOT ported: the Flutter app had no Bible bookmarks and the schema has no
 * bookmarks table. This interface is the forward contract — it stays
 * unimplemented until a `bookmarks` table is added (no schema/SQL invention).
 */
export interface BookmarkService {
  /** All of the current user's bookmarks. */
  getBookmarks(): Promise<Bookmark[]>;
  addBookmark(reference: Reference, label?: string): Promise<Bookmark>;
  removeBookmark(id: string): Promise<void>;
  /** Whether a reference is already bookmarked (for toggle UI). */
  hasBookmark(reference: Reference): Promise<boolean>;
}

export class SupabaseBookmarkService implements BookmarkService {
  getBookmarks(): Promise<Bookmark[]> {
    return requiresTable("BookmarkService.getBookmarks", "bookmarks");
  }
  addBookmark(_reference: Reference, _label?: string): Promise<Bookmark> {
    return requiresTable("BookmarkService.addBookmark", "bookmarks");
  }
  removeBookmark(_id: string): Promise<void> {
    return requiresTable("BookmarkService.removeBookmark", "bookmarks");
  }
  hasBookmark(_reference: Reference): Promise<boolean> {
    return requiresTable("BookmarkService.hasBookmark", "bookmarks");
  }
}
