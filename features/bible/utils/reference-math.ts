import type { Book } from "../types";
import type { ChapterReference, Reference } from "../types";

/**
 * Pure navigation math over the canonical book list. Powers infinite chapter
 * navigation (prev/next across book boundaries) and parallel-pane syncing.
 * `books` is the chapter-count source of truth (fetched via `useBooks`).
 */

/** Returns the first chapter reference of a book. */
export function firstChapterOf(bookNumber: number): ChapterReference {
  return { bookNumber, chapter: 1 };
}

/** Returns the last chapter reference of a book. */
export function lastChapterOf(book: Book): ChapterReference {
  return { bookNumber: book.bookNumber, chapter: book.chapters };
}

/** Advances one chapter forward, wrapping to the next book. */
export function nextChapter(
  ref: ChapterReference,
  books: Book[],
): ChapterReference | null {
  const book = books.find((b) => b.bookNumber === ref.bookNumber);
  if (!book) return null;
  if (ref.chapter < book.chapters) {
    return { bookNumber: ref.bookNumber, chapter: ref.chapter + 1 };
  }
  const nextBook = books.find(
    (b) => b.bookNumber === ref.bookNumber + 1,
  );
  return nextBook ? firstChapterOf(nextBook.bookNumber) : null;
}

/** Moves one chapter backward, wrapping to the previous book. */
export function prevChapter(
  ref: ChapterReference,
  books: Book[],
): ChapterReference | null {
  if (ref.chapter > 1) {
    return { bookNumber: ref.bookNumber, chapter: ref.chapter - 1 };
  }
  const prevBook = books.find(
    (b) => b.bookNumber === ref.bookNumber - 1,
  );
  return prevBook ? lastChapterOf(prevBook) : null;
}

/** Clamps a chapter number into the valid range of its book. */
export function clampChapter(
  ref: ChapterReference,
  books: Book[],
): ChapterReference {
  const book = books.find((b) => b.bookNumber === ref.bookNumber);
  if (!book) return ref;
  const chapter = Math.min(Math.max(ref.chapter, 1), book.chapters);
  return { bookNumber: ref.bookNumber, chapter };
}

/** Returns the book/chapter range [first..last] across the whole canon. */
export function canonRange(books: Book[]): {
  first: ChapterReference;
  last: ChapterReference;
} {
  const first = books[0];
  const last = books[books.length - 1];
  if (!first || !last) throw new Error("[bible] no books available");
  return { first: firstChapterOf(first.bookNumber), last: lastChapterOf(last) };
}

/** Clamps any reference into a valid chapter (verse kept if present). */
export function clampReference(ref: Reference, books: Book[]): Reference {
  const clamped = clampChapter(ref, books);
  return { ...clamped, verse: ref.verse };
}
