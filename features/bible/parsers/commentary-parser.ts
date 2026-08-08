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
  const referenceResolver = (label: string) =>
    parseReferenceTarget(label, options.books);
  const blocks = trimLeadingBreaks(
    parseVerseText(entry.text, { referenceResolver }),
  );
  return { marker: entry.marker, blocks };
}
