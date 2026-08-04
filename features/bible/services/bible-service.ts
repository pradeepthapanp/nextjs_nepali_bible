import type { SupabaseClient } from "@supabase/supabase-js";
import { testamentOf } from "../constants";
import type {
  BibleVersion,
  Book,
  Reference,
  Verse,
  VerseTitle,
} from "../types";
import { unwrap } from "./helpers";

/**
 * Bible reading service — a direct port of the SupabaseRepository Bible
 * methods: `getAllBibles`, `getBibleBooks`, `getVerses`, `getSingleVerse`,
 * `getSingleVerseByUuid`, `getVerseTitles`.
 *
 * Queries reuse the existing tables exactly (`bibles`, `bible_books_complete`,
 * version-specific verses tables, `bible_verse_titles`) with no schema or SQL
 * changes. Browser client for React Query; a server client can be passed in
 * for Server Components.
 */

export interface BibleService {
  /** All available Bible versions (replaces `getAllBibles`). */
  getVersions(): Promise<BibleVersion[]>;
  /** A single version by id. */
  getVersionById(id: string): Promise<BibleVersion | null>;
  /** The canonical book list (replaces `getBibleBooks`). */
  getBooks(): Promise<Book[]>;
  /** Verses for a chapter (replaces `getVerses`). */
  getVerses(
    versionId: string,
    bookNumber: number,
    chapter: number,
  ): Promise<Verse[]>;
  /** A single verse by reference (replaces `getSingleVerse`). */
  getVerse(versionId: string, reference: Reference): Promise<Verse | null>;
  /** A single verse by row uuid (replaces `getSingleVerseByUuid`). */
  getVerseByUuid(versionId: string, uuid: string): Promise<Verse | null>;
  /** Section titles for a chapter (replaces `getVerseTitles`). */
  getVerseTitles(
    bookNumber: number,
    chapter: number,
  ): Promise<VerseTitle[]>;
}

/* Row shapes as returned by Supabase (snake_case column names). */

interface BibleVersionRow {
  id: string;
  name: string;
  table_name: string;
  short_code: string;
  title: string | null;
  description: string | null;
}

interface BookRow {
  book_number: number;
  short_name: string;
  long_name: string;
  eng_long_name: string;
  eng_short_name: string;
  chapters: number;
}

interface VerseRow {
  uuid: string;
  book_number: number;
  chapter: number;
  verse: number;
  text: string;
}

interface VerseTitleRow {
  book_number: number;
  chapter: number;
  verse: number;
  order_if_several: number;
  title: string;
}

/** Maps a `bibles` row. `language` is inferred from the table name. */
function mapBibleVersion(row: BibleVersionRow): BibleVersion {
  return {
    id: row.id,
    name: row.name,
    tableName: row.table_name,
    shortCode: row.short_code,
    title: row.title ?? undefined,
    description: row.description ?? undefined,
    language: inferLanguage(row.table_name),
  };
}

/** The `bibles` table has no language column; infer from the table name. */
function inferLanguage(tableName: string): "ne" | "en" | undefined {
  if (/_(np|ne)\b/.test(tableName)) return "ne";
  if (/_(en|english)\b/.test(tableName)) return "en";
  return undefined;
}

/** Maps a `bible_books_complete` row; testament derives from the book code. */
function mapBook(row: BookRow): Book {
  return {
    bookNumber: row.book_number,
    shortName: row.short_name,
    longName: row.long_name,
    engShortName: row.eng_short_name,
    engLongName: row.eng_long_name,
    chapters: row.chapters,
    testament: testamentOf(row.book_number),
  };
}

function mapVerse(row: VerseRow): Verse {
  return {
    uuid: row.uuid,
    bookNumber: row.book_number,
    chapter: row.chapter,
    verse: row.verse,
    text: row.text,
  };
}

function mapVerseTitle(row: VerseTitleRow): VerseTitle {
  return {
    bookNumber: row.book_number,
    chapter: row.chapter,
    verse: row.verse,
    orderIfSeveral: row.order_if_several,
    title: row.title,
  };
}

export class SupabaseBibleService implements BibleService {
  constructor(private readonly client: SupabaseClient) {}

  /** Memoized versions fetch — matches Flutter's cached `biblesProvider`. */
  private versionsCache: Promise<BibleVersion[]> | null = null;

  getVersions(): Promise<BibleVersion[]> {
    if (!this.versionsCache) {
      // `Promise.resolve` adapts the Supabase thenable builder into a real
      // Promise so the memoized field keeps a clean Promise type.
      this.versionsCache = Promise.resolve(
        this.client.from("bibles").select().order("name"),
      ).then((response) => unwrap(response).map(mapBibleVersion));
    }
    return this.versionsCache;
  }

  async getVersionById(id: string): Promise<BibleVersion | null> {
    const response = await this.client
      .from("bibles")
      .select()
      .eq("id", id)
      .maybeSingle();
    const row = unwrap(response) as BibleVersionRow | null;
    return row ? mapBibleVersion(row) : null;
  }

  async getBooks(): Promise<Book[]> {
    const response = await this.client
      .from("bible_books_complete")
      .select()
      .order("sorting_order");
    return unwrap(response).map(mapBook);
  }

  /** Resolves a version id to its verses table (via the cached versions list). */
  private async tableForVersion(versionId: string): Promise<string> {
    const versions = await this.getVersions();
    const version = versions.find((entry) => entry.id === versionId);
    if (!version) {
      throw new Error(`[bible] unknown Bible version: ${versionId}`);
    }
    return version.tableName;
  }

  async getVerses(
    versionId: string,
    bookNumber: number,
    chapter: number,
  ): Promise<Verse[]> {
    const table = await this.tableForVersion(versionId);
    const response = await this.client
      .from(table)
      .select()
      .eq("book_number", bookNumber)
      .eq("chapter", chapter)
      .order("verse");
    return unwrap(response).map(mapVerse);
  }

  async getVerse(
    versionId: string,
    reference: Reference,
  ): Promise<Verse | null> {
    const table = await this.tableForVersion(versionId);
    const response = await this.client
      .from(table)
      .select()
      .eq("book_number", reference.bookNumber)
      .eq("chapter", reference.chapter)
      .eq("verse", reference.verse)
      .maybeSingle();
    const row = unwrap(response) as VerseRow | null;
    return row ? mapVerse(row) : null;
  }

  async getVerseByUuid(versionId: string, uuid: string): Promise<Verse | null> {
    const table = await this.tableForVersion(versionId);
    const response = await this.client
      .from(table)
      .select()
      .eq("uuid", uuid)
      .maybeSingle();
    const row = unwrap(response) as VerseRow | null;
    return row ? mapVerse(row) : null;
  }

  async getVerseTitles(
    bookNumber: number,
    chapter: number,
  ): Promise<VerseTitle[]> {
    const response = await this.client
      .from("bible_verse_titles")
      .select()
      .eq("book_number", bookNumber)
      .eq("chapter", chapter)
      .order("verse")
      .order("order_if_several");
    return unwrap(response).map(mapVerseTitle);
  }
}
