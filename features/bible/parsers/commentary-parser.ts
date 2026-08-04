import type { Book, CommentaryEntry, Reference } from "../types";
import { parseVerseText } from "./engine";
import type { CommentaryRenderTree } from "./types";

export interface CommentaryParseOptions {
  /** The canonical book list used to resolve `<reflink>` targets. */
  books: Book[];
}

/**
 * Port of Flutter `CmtParser.openReference` (`cmt_parse.dart`): parses a
 * `<reflink target="Gen 1:1">` label into a `Reference` by matching the
 * English short book name, or null when unresolvable.
 */
export function parseReferenceTarget(
  target: string,
  books: Book[],
): Reference | null {
  const parts = target.split(" ");
  if (parts.length !== 2) return null;
  const bookName = parts[0];
  const cv = parts[1].split(":");
  if (cv.length !== 2) return null;
  const chapter = Number(cv[0]);
  const verse = Number(cv[1]);
  if (Number.isNaN(chapter) || Number.isNaN(verse)) return null;
  const index = books.findIndex(
    (book) => book.engShortName.toLowerCase() === bookName.toLowerCase(),
  );
  if (index === -1) return null;
  return { bookNumber: books[index].bookNumber, chapter, verse };
}

/**
 * Port of Flutter `CmtParser` — parses a commentary entry's HTML body (which
 * may include `<reflink>` links, bold/italic, etc.) into blocks, keeping the
 * marker chip alongside.
 */
export function parseCommentary(
  entry: CommentaryEntry,
  options: CommentaryParseOptions,
): CommentaryRenderTree {
  const referenceResolver = (label: string) =>
    parseReferenceTarget(label, options.books);
  const blocks = parseVerseText(entry.text, { referenceResolver });
  return { marker: entry.marker, blocks };
}
