import type { Book } from "../types";
import type { Reference, VerseRange } from "../types";

/**
 * Pure reference formatting/parsing helpers. No React, no I/O — safe for both
 * server and client, and directly unit-testable.
 */

/** Formats a reference as "उत्पत्ति 1:2" (book + chapter[:verse]). */
export function referenceToString(ref: Reference, books: Book[]): string {
  const book = books.find((b) => b.bookNumber === ref.bookNumber);
  const bookName = book?.longName ?? String(ref.bookNumber);
  const chapter = ref.chapter;
  return ref.verse !== undefined
    ? `${bookName} ${chapter}:${ref.verse}`
    : `${bookName} ${chapter}`;
}

/** Formats a verse range as "उत्पत्ति 1:2–5". */
export function verseRangeToString(range: VerseRange, books: Book[]): string {
  const book = books.find((b) => b.bookNumber === range.bookNumber);
  const bookName = book?.longName ?? String(range.bookNumber);
  return `${bookName} ${range.chapter}:${range.start}–${range.end}`;
}

/** Returns true when both references point to the same verse. */
export function isSameReference(a: Reference, b: Reference): boolean {
  return (
    a.bookNumber === b.bookNumber &&
    a.chapter === b.chapter &&
    (a.verse ?? 0) === (b.verse ?? 0)
  );
}

/**
 * The `bible_books_complete` table numbers books with its OWN scheme (e.g.
 * Genesis=10, Exodus=20, Luke=490) — NOT the canonical 1..66 order. The
 * `getBooks` query orders by `sorting_order`, which IS the canonical order, so
 * `books[canonicalNumber - 1]` is the canonical book. Cross-content metadata
 * that stores a 1..66 canonical number (e.g. articles' `related_book_number`)
 * must be resolved through this helper.
 */
export function canonicalBook(
  books: Book[],
  canonicalNumber: number,
): Book | undefined {
  return books[canonicalNumber - 1];
}

/** Inverse of `canonicalBook`: app bookNumber → canonical position (1..66). */
export function canonicalNumber(
  books: Book[],
  appBookNumber: number,
): number | undefined {
  const index = books.findIndex((b) => b.bookNumber === appBookNumber);
  return index === -1 ? undefined : index + 1;
}

/**
 * Parses a canonical reference string ("उत्पत्ति 1:2" / "1:2" / "1").
 * Book matching is attempted by name first, then by number.
 * Returns null when the string cannot be parsed.
 */
export function parseReference(
  input: string,
  books: Book[],
): Reference | null {
  // Placeholder implementation — full parsing (Nepali book names, chapter/verse
  // split, optional verse ranges) is implemented during migration.
  void books;
  const trimmed = input.trim();
  if (!trimmed) return null;
  throw new Error("[bible] parseReference not implemented yet");
}
