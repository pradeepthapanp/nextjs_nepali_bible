import type { Book, VerseTitle } from "../types";
import { parseVerseText } from "./engine";
import type { TitleRenderTree } from "./types";

export interface TitleParseOptions {
  /** The canonical book list used to expand numeric book references. */
  books: Book[];
}

/**
 * Port of Flutter `TitleParser` (`title_parser.dart`): replaces numeric book
 * references inside a title with the book's Nepali short name (e.g.
 * "१–१२" → "उत–प्रकाश"), then parses the edited title (which may contain
 * `<x>` tags) into a render tree.
 */
export function editTitle(title: string, books: Book[]): string {
  return title.replace(/\d+/g, (match) => {
    const number = parseInt(match, 10);
    const book = books.find((entry) => entry.bookNumber === number);
    return book?.shortName ?? match;
  });
}

export function parseTitle(
  title: VerseTitle,
  options: TitleParseOptions,
): TitleRenderTree {
  const edited = editTitle(title.title, options.books);
  const blocks = parseVerseText(edited, { language: "ne" });
  return { title: edited, blocks };
}

/** Parses a whole chapter's set of section titles. */
export function parseTitles(
  titles: VerseTitle[],
  options: TitleParseOptions,
): TitleRenderTree[] {
  return titles.map((title) => parseTitle(title, options));
}
