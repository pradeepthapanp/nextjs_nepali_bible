/**
 * Notice constants — extracted from the Flutter implementation
 * (`notices_provider.dart` `_pageSize`, `add_notice_page.dart` upload path +
 * default expiry, `helpers/enums.dart` `NoticeSort`). Nothing invented.
 */
import type { NoticeSort } from "../types";

/** Infinite-list page size (Flutter `NoticesNotifier._pageSize = 50`). */
export const NOTICE_PAGE_SIZE = 50;

/**
 * The notice image upload folder. Flutter `AddNewNoticePage` builds
 * `notices/{timestamp}.{ext}` and `UploadNotifier.uploadImage` prepends
 * `images/` → the storage path is `images/notices/{timestamp}.{ext}` (the
 * shared `UploadService` receives the FULL path — the caller builds it).
 */
export const NOTICE_IMAGE_UPLOAD_FOLDER = "notices";

/** The default publish state for a new notice (Flutter `_isPublished = false`
 * in the form; the repository default is `true` — the form explicitly toggles
 * publish, so the composer defaults to NOT published and lets the user flip it). */
export const NOTICE_DEFAULT_IS_PUBLISHED = false;

/**
 * The default expiry for a NEW notice: Flutter seeds `_expiresAt` with the
 * 1st of the next month (`DateTime(now.year, now.month + 1, now.day)`).
 * Editors pick a date (firstDate = today) — the constant documents the seed.
 */
export const NOTICE_DEFAULT_EXPIRES_NEXT_MONTH = true;

/** The sort options (Flutter `NoticeSort`), in display order. */
export const NOTICE_SORT_OPTIONS: NoticeSort[] = [
  "newest",
  "oldest",
  "alphabetical",
];
