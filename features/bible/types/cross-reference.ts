import type { Book } from "./book";
import type { Reference } from "./reference";

/**
 * A cross reference from a source verse to a target passage. Mirrors the
 * Flutter `CrossRef` model (`lib/models/crossref_model.dart`).
 */
export interface CrossReference {
  /** Source book number. */
  book: number;
  /** Source chapter number. */
  chapter: number;
  /** Source verse start. */
  verse: number;
  /** Inclusive source verse range end; `undefined` for a single verse. */
  verseEnd?: number;
  /** Target book number. */
  bookTo: number;
  /** Target chapter number. */
  chapterTo: number;
  /** Target verse range start. */
  verseToStart?: number;
  /** Inclusive target verse range end. */
  verseToEnd?: number;
  votes: number;
}

/** Source reference of a cross reference (derived). */
export function crossReferenceSource(ref: CrossReference): Reference {
  return {
    bookNumber: ref.book,
    chapter: ref.chapter,
    verse: ref.verse,
  };
}

/**
 * A cross reference resolved against the target book metadata and (optionally)
 * the target verse text — what the future ReferenceVersesSheet renders.
 */
export interface ResolvedCrossReference extends CrossReference {
  /** Target book metadata (for building a display string), when in the canon. */
  targetBook?: Book;
  /** Target verse text (filled by the service when requested). */
  targetText?: string;
}
