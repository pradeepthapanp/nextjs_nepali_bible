import type { Book, CommentaryEntry, Reference } from "../types";
import { parseVerseText } from "./engine";
import type { BlockNode, InlineNode } from "./types";
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
 * Parses a numeric book-number reference used by Wiersbe-style anchor links
 * (`<a href='B:470 21:1-7'>२:१४</a>`): `B:<book> <chapter>:<verseStart>`.
 * Returns a Reference pointing at the START of the verse range.
 */
export function parseBookNumberReference(label: string): Reference | null {
  const match = /^B:(\d+)\s+(\d+):(\d+)/.exec(label.trim());
  if (!match) return null;
  const bookNumber = Number(match[1]);
  const chapter = Number(match[2]);
  const verse = Number(match[3]);
  if (Number.isNaN(bookNumber) || Number.isNaN(chapter) || Number.isNaN(verse)) {
    return null;
  }
  return { bookNumber, chapter, verse };
}

/** True when an inline node is a hard line break (`<br>`). */
function isLineBreak(node: InlineNode): boolean {
  return node.type === "line-break";
}

/** True when a paragraph block is empty or holds only line breaks (a blank run). */
function isBlankBlock(block: BlockNode): boolean {
  return block.type === "paragraph" && block.children.every(isLineBreak);
}

/**
 * Commentary bodies often begin with stray `<br>` line breaks — either
 * top-level or wrapped in otherwise-empty `<p>`/`<div>` wrappers (transparent
 * to the parser). They parse to leading `line-break` nodes / blank paragraph
 * blocks, which would render as an empty first line. Removing them here (on
 * the parsed tree) robustly ignores those leading `<br>` tags regardless of
 * how they were nested in the source HTML.
 */
function trimLeadingBreaks(blocks: BlockNode[]): BlockNode[] {
  let index = 0;
  while (index < blocks.length && isBlankBlock(blocks[index])) index += 1;
  const trimmed = blocks.slice(index);
  if (trimmed.length > 0 && trimmed[0].type === "paragraph") {
    const children = trimmed[0].children.slice();
    let cursor = 0;
    while (cursor < children.length && isLineBreak(children[cursor])) cursor += 1;
    if (cursor > 0) trimmed[0] = { ...trimmed[0], children: children.slice(cursor) };
  }
  return trimmed;
}

/**
 * Port of Flutter `CmtParser` — parses a commentary entry's HTML body (which
 * may include `<reflink>` links, bold/italic, etc.) into blocks, keeping the
 * marker chip alongside. Leading `<br>` tags are ignored (see above).
 */
export function parseCommentary(
  entry: CommentaryEntry,
  options: CommentaryParseOptions,
): CommentaryRenderTree {
  // Resolve both English-name reflinks ("Gen 1:1") and numeric book-number
  // anchors ("B:470 21:1-7" — used by Wiersbe outlines).
  const referenceResolver = (label: string) =>
    parseBookNumberReference(label) ??
    parseReferenceTarget(label, options.books);
  const blocks = trimLeadingBreaks(
    parseVerseText(entry.text, { referenceResolver }),
  );
  return { marker: entry.marker, blocks };
}
