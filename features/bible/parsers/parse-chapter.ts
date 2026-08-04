import type {
  Book,
  ChapterContent,
  CommentaryEntry,
  CrossReference,
  Verse,
} from "../types";
import {
  parseCommentary,
  type CommentaryParseOptions,
} from "./commentary-parser";
import {
  parseTitles,
  type TitleParseOptions,
} from "./title-parser";
import { parseVerse } from "./verse-parser";
import type {
  CommentaryRenderTree,
  TitleRenderTree,
  VerseParseOptions,
  VerseRenderTree,
} from "./types";

/**
 * parseChapterContent — the "parser output" for a whole chapter.
 *
 * Maps a `ChapterContent` (from `useChapterContent`) into per-verse render
 * trees, using the exact association rules from Flutter's `ver_display.dart`:
 *   - titles:     `verseTitles.where(t => t.verse === verse.verse)`
 *   - commentary: `cmts.where(c => c.verseNumberFrom === verse.verse)`
 *   - crossRefs:  `crossRefs.where(r => r.verse === verse.verse)`
 *
 * Kept OUTSIDE the ChapterViewer component so parsing stays a pure, testable
 * engine concern and callers can pre-parse (e.g. during SSR) if they wish.
 */

export interface ParsedChapterCommentary {
  /** The raw commentary entry (for callbacks that need it). */
  entry: CommentaryEntry;
  /** The parsed commentary render tree. */
  parsed: CommentaryRenderTree;
}

export interface ParsedChapterVerse {
  verse: Verse;
  tree: VerseRenderTree;
  /** Section titles anchored to this verse. */
  titles: TitleRenderTree[];
  /** Commentary entries anchored to this verse. */
  commentary: ParsedChapterCommentary[];
  /** Cross references whose source verse is this verse. */
  crossReferences: CrossReference[];
}

export interface ParsedChapter {
  versionId: string;
  bookNumber: number;
  chapter: number;
  verses: ParsedChapterVerse[];
}

export interface ParseChapterOptions {
  /** Canonical books — used for title book-name expansion, commentary
   *  `<reflink>` resolution and cross-reference chip labels. */
  books?: Book[];
  /** Options forwarded to `parseVerse` for every verse. */
  verse?: VerseParseOptions;
}

const NO_BOOKS: Book[] = [];

export function parseChapterContent(
  content: ChapterContent,
  options: ParseChapterOptions = {},
): ParsedChapter {
  const books = options.books ?? NO_BOOKS;
  const titleOptions: TitleParseOptions = { books };
  const commentaryOptions: CommentaryParseOptions = { books };
  const language = options.verse?.language ?? "ne";

  const verses: ParsedChapterVerse[] = content.verses.map((verse) => {
    const titles = content.titles.filter((title) => title.verse === verse.verse);
    const commentary: ParsedChapterCommentary[] = (content.commentaries ?? [])
      .filter((entry) => entry.verseNumberFrom === verse.verse)
      .map((entry) => ({ entry, parsed: parseCommentary(entry, commentaryOptions) }));
    const crossReferences = (content.crossReferences ?? []).filter(
      (reference) => reference.verse === verse.verse,
    );

    return {
      verse,
      tree: parseVerse(verse, language, options.verse),
      titles: parseTitles(titles, titleOptions),
      commentary,
      crossReferences,
    };
  });

  return {
    versionId: content.versionId,
    bookNumber: content.bookNumber,
    chapter: content.chapter,
    verses,
  };
}
