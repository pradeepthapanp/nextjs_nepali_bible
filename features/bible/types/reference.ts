/**
 * Canonical scripture reference — the address of a book, chapter or verse.
 * Book numbers follow the canonical 1..66 enumeration (1 = Genesis) unless the
 * migrated backend uses a different offset (see constants/canonical.ts).
 */

export type Testament = "ot" | "nt";

export interface Reference {
  /** Canonical book number (1..66). */
  bookNumber: number;
  /** Chapter number (1-based). */
  chapter: number;
  /** Verse number (1-based); omitted for book/chapter references. */
  verse?: number;
}

/** A half-open range of verses within one chapter. */
export interface VerseRange {
  bookNumber: number;
  chapter: number;
  start: number;
  end: number;
}

/** Compares two references (null if either is undefined). */
export function compareReferences(a: Reference, b: Reference): number {
  if (a.bookNumber !== b.bookNumber) return a.bookNumber - b.bookNumber;
  if (a.chapter !== b.chapter) return a.chapter - b.chapter;
  return (a.verse ?? 0) - (b.verse ?? 0);
}
