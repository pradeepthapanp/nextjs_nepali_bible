import { toNepaliDigits } from "../utils/nepali-numbers";
import type { Book, CrossReference } from "../types";

/**
 * Cross-reference display parsers — a port of Flutter `RefParses`
 * (`ref_parse.dart`), which renders each `CrossRef` as a tappable chip:
 * `<book.shortName> <chapterTo in Nepali>:<verseToStart in Nepali><,>`.
 */

/** Formats a single cross reference as display text (e.g. "उत 1:2,"). */
export function formatCrossReference(
  reference: CrossReference,
  books: Book[],
  isLast: boolean,
): string {
  const book = books.find((entry) => entry.bookNumber === reference.bookTo);
  const shortName = book?.shortName ?? String(reference.bookTo);
  const suffix = isLast ? "" : ",";
  return `${shortName} ${toNepaliDigits(reference.chapterTo)}:${toNepaliDigits(
    reference.verseToStart ?? 1,
  )}${suffix}`;
}

/** Formats a list of cross references (comma-joined chip labels). */
export function formatCrossReferences(
  references: CrossReference[],
  books: Book[],
): string[] {
  return references.map((reference, index) =>
    formatCrossReference(reference, books, index === references.length - 1),
  );
}

/**
 * Parses a compact inline marker ("book.chapter.verse", e.g. "1.2.3") into a
 * `CrossReference`. Used by the cross-ref-markers plugin when inline
 * superscript markers are added to the dataset; returns null on non-match.
 */
export function parseCrossReferenceMarker(
  marker: string,
): CrossReference | null {
  const match = marker.trim().match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) return null;
  return {
    book: 0,
    bookTo: Number(match[1]),
    chapter: 0,
    chapterTo: Number(match[2]),
    verse: 0,
    verseToStart: Number(match[3]),
    votes: 0,
  };
}
