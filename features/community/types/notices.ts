/**
 * Notice domain types — a direct port of the Flutter `Notice` model
 * (`lib/models/notice.dart`, Supabase `notices` table), following the web
 * convention (snake_case rows → camelCase domain, ISO string dates).
 *
 * Table columns verified against the live backend (`notices` exists with
 * exactly these columns — see `services/README.md`). NOTICES HAVE NO COMMENTS:
 * the Flutter app defines no `NoticeComment` model and no `notice_comments`
 * table exists in the backend (verified) — see the main README.
 */

/** A notice (the `notices` table row). */
export interface Notice {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  userId?: string;
  isPublished: boolean;
  publishedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** The create/edit fields of a notice (Flutter `AddNewNoticePage._save`). */
export interface NoticeInput {
  title: string;
  description?: string;
  imageUrl?: string;
  isPublished: boolean;
  publishedAt?: string;
  expiresAt?: string;
}

/** The update shape (notice id + the editable fields). */
export interface NoticeUpdate extends NoticeInput {
  id: string;
}

/** The notice list sort (Flutter `NoticeSort` in `helpers/enums.dart`). */
export type NoticeSort = "newest" | "oldest" | "alphabetical";
