import type { Testament } from "../types";

/**
 * Static canonical facts about the Bible (book counts, testament boundaries,
 * defaults). Per-book chapter counts are **data** fetched by `useBooks` from
 * the backend — they are not duplicated here.
 *
 * BOOK NUMBERING: the backend does NOT use 1..66. `bible_books_complete` rows
 * carry DB "book codes" — Old Testament books are `book_number` 0..460, New
 * Testament books are 470..730 (see Flutter `book_selection_widget.dart`), and
 * Genesis is book 10 (see Flutter `Setting.initial` / `BookNameNP.initial`).
 * The canonical ordering is the list position after `.order('sorting_order')`
 * (positions 0..38 = OT, 39..65 = NT — see `audio_bible_list.dart`).
 */

/** Number of Old Testament books (by canonical position). */
export const OLD_TESTAMENT_BOOK_COUNT = 39;
/** Number of New Testament books (by canonical position). */
export const NEW_TESTAMENT_BOOK_COUNT = 27;
export const TOTAL_BOOKS = OLD_TESTAMENT_BOOK_COUNT + NEW_TESTAMENT_BOOK_COUNT;

/** Backend `book_number` code ranges (see Flutter `book_selection_widget.dart`). */
export const OLD_TESTAMENT_MAX_BOOK_CODE = 460;
export const NEW_TESTAMENT_MIN_BOOK_CODE = 470;

/** Default reading position (Genesis 1) — matches the Flutter app default. */
export const DEFAULT_BOOK_NUMBER = 10; // Genesis (backend book code)
export const DEFAULT_CHAPTER_NUMBER = 1;
export const DEFAULT_VERSE_NUMBER = 1;

/** The minimum chapter/verse numbers used throughout the app. */
export const MIN_CHAPTER = 1;
export const MIN_VERSE = 1;

/**
 * Returns the testament of a backend `book_number` code, ported directly from
 * Flutter `book_selection_widget.dart` (OT 0..460, NT 470..730).
 */
export function testamentOf(bookNumber: number): Testament {
  return bookNumber >= NEW_TESTAMENT_MIN_BOOK_CODE ? "nt" : "ot";
}
