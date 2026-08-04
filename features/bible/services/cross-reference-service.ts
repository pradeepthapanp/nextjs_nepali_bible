import type { SupabaseClient } from "@supabase/supabase-js";
import type { BibleService } from "./bible-service";
import type { CrossReference, ResolvedCrossReference } from "../types";
import { unwrap } from "./helpers";

/**
 * Cross-reference service — a port of the SupabaseRepository
 * `getCrossReferences` method, plus target-text resolution. Target text reuses
 * `BibleService.getVerses` (exactly what the Flutter
 * `crossReferenceVersesProvider` did — it fetched the target chapter's verses
 * from the current Bible table), so there is no separate query path.
 */

export interface CrossReferenceService {
  /** Raw cross references for a chapter (replaces `getCrossReferences`). */
  getCrossReferences(
    bookNumber: number,
    chapter: number,
  ): Promise<CrossReference[]>;
  /**
   * Resolves a set of cross references with target book metadata and verse
   * text — used by the future ReferenceVersesSheet.
   */
  resolveReferences(
    references: CrossReference[],
    versionId: string,
  ): Promise<ResolvedCrossReference[]>;
}

interface CrossReferenceRow {
  book: number;
  book_to: number;
  chapter: number;
  chapter_to: number;
  verse: number;
  verse_end: number | null;
  verse_to_end: number | null;
  verse_to_start: number | null;
  votes: number;
}

function mapCrossReference(row: CrossReferenceRow): CrossReference {
  return {
    book: row.book,
    bookTo: row.book_to,
    chapter: row.chapter,
    chapterTo: row.chapter_to,
    verse: row.verse,
    verseEnd: row.verse_end ?? undefined,
    verseToStart: row.verse_to_start ?? undefined,
    verseToEnd: row.verse_to_end ?? undefined,
    votes: row.votes,
  };
}

export class SupabaseCrossReferenceService
  implements CrossReferenceService
{
  constructor(
    private readonly client: SupabaseClient,
    private readonly bible: BibleService,
  ) {}

  async getCrossReferences(
    bookNumber: number,
    chapter: number,
  ): Promise<CrossReference[]> {
    const response = await this.client
      .from("cross_references")
      .select()
      .eq("book", bookNumber)
      .eq("chapter", chapter);
    return unwrap(response).map(mapCrossReference);
  }

  async resolveReferences(
    references: CrossReference[],
    versionId: string,
  ): Promise<ResolvedCrossReference[]> {
    const books = await this.bible.getBooks();

    return Promise.all(
      references.map(async (reference) => {
        // Fetch the target chapter's verses (same as Flutter's
        // crossReferenceVersesProvider) and keep only the referenced range.
        const verses = await this.bible.getVerses(
          versionId,
          reference.bookTo,
          reference.chapterTo,
        );
        const inRange = verses.filter((verse) => {
          if (reference.verseToStart !== undefined && verse.verse < reference.verseToStart) {
            return false;
          }
          if (reference.verseToEnd !== undefined && verse.verse > reference.verseToEnd) {
            return false;
          }
          return true;
        });

        return {
          ...reference,
          targetBook: books.find(
            (book) => book.bookNumber === reference.bookTo,
          ),
          targetText: inRange.map((verse) => verse.text).join(" "),
        } satisfies ResolvedCrossReference;
      }),
    );
  }
}
