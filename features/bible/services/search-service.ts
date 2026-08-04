import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_BIBLE_VERSION, SEARCH_MAX_RESULTS } from "../constants";
import type { BibleVersion, SearchFilters, SearchResult } from "../types";
import type { BibleService } from "./bible-service";
import { unwrap } from "./helpers";

/**
 * Verse search service.
 *
 * The Flutter search (search_verses.dart) was scaffolded but its repository
 * method was never implemented, so this cannot be "ported" directly — see the
 * summary. It is implemented faithfully against the existing schema:
 *   - searches the selected version's verses table with `ilike` on `text`
 *     (no new tables/SQL);
 *   - when `priority` is "english" and an English version exists, searches that
 *     table first (mirroring the intended Flutter behaviour of searching the
 *     primary + secondary tables);
 *   - testament filtering uses the book-code ranges (via `getBooks()`), ordered
 *     by book/chapter/verse and limited like the Flutter `maxResults = 100`.
 */

export interface SearchService {
  /** Full-text search across verses in a version. */
  searchVerses(
    query: string,
    filters: SearchFilters,
  ): Promise<SearchResult[]>;
}

interface SearchableRow {
  uuid: string;
  book_number: number;
  chapter: number;
  verse: number;
  text: string;
  /** Which version this row came from (for multi-table search). */
  __version: BibleVersion;
}

export class SupabaseSearchService implements SearchService {
  constructor(
    private readonly client: SupabaseClient,
    private readonly bible: BibleService,
  ) {}

  async searchVerses(
    query: string,
    filters: SearchFilters,
  ): Promise<SearchResult[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const limit = filters.limit ?? SEARCH_MAX_RESULTS;

    // Resolve the tables to search (primary = selected version).
    const versions = await this.bible.getVersions();
    const primary =
      versions.find((version) => version.id === filters.versionId) ??
      DEFAULT_BIBLE_VERSION;

    const tables: BibleVersion[] = [primary];
    if (filters.priority === "english") {
      const english = versions.find((version) => version.language === "en");
      if (english && english.id !== primary.id) tables.unshift(english);
    }

    // Restrict to a testament when requested (book-code ranges).
    const books = await this.bible.getBooks();
    const bookNumbers =
      filters.testament && filters.testament !== "all"
        ? books
            .filter((book) => book.testament === filters.testament)
            .map((book) => book.bookNumber)
        : undefined;

    const rows: SearchableRow[] = [];
    for (const version of tables) {
      let queryBuilder = this.client
        .from(version.tableName)
        .select()
        .ilike("text", `%${trimmed}%`);
      if (bookNumbers && bookNumbers.length > 0) {
        queryBuilder = queryBuilder.in("book_number", bookNumbers);
      }
      const response = await queryBuilder
        .order("book_number")
        .order("chapter")
        .order("verse")
        .limit(limit);
      const data = unwrap(response) as SearchableRow[];
      rows.push(...data.map((row) => ({ ...row, __version: version })));
    }

    return rows.map((row) => {
      const book = books.find((entry) => entry.bookNumber === row.book_number);
      if (!book) {
        throw new Error(
          `[bible] search hit unknown book_number ${row.book_number} — book list is out of sync`,
        );
      }
      return {
        verse: {
          uuid: row.uuid,
          bookNumber: row.book_number,
          chapter: row.chapter,
          verse: row.verse,
          text: row.text,
        },
        version: row.__version,
        book,
        snippet: row.text,
        // Ordering is by book/chapter/verse; no relevance algorithm exists to
        // port, so every result scores equally.
        score: 0,
      } satisfies SearchResult;
    });
  }
}
