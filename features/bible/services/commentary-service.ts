import type { SupabaseClient } from "@supabase/supabase-js";
import type { Commentary, CommentaryEntry } from "../types";
import { unwrap } from "./helpers";

/**
 * Commentary service — a direct port of the SupabaseRepository commentary
 * methods (`getAllCommentaries`, `getCommentaries`). Reads commentary *books*
 * from the `commentaries` table and per-chapter entries from the
 * commentary-specific `commentaries_*` tables.
 */

export interface CommentaryService {
  /** All available commentary books (replaces `getAllCommentaries`). */
  getCommentaryVersions(): Promise<Commentary[]>;
  /** Entries for a chapter (replaces `getCommentaries`). */
  getCommentaries(
    commentaryId: string,
    bookNumber: number,
    chapter: number,
  ): Promise<CommentaryEntry[]>;
  /** Whether the commentary book has ANY entries (detects empty tables). */
  hasContent(commentaryId: string): Promise<boolean>;
}

interface CommentaryRow {
  id: string;
  name: string;
  table_name: string;
  short_code: string;
  title: string | null;
  description: string | null;
}

interface CommentaryEntryRow {
  book_number: number;
  chapter_number_from: number | null;
  chapter_number_to: number | null;
  verse_number_from: number | null;
  verse_number_to: number | null;
  marker: string | number | null;
  text: string | null;
}

function mapCommentary(row: CommentaryRow): Commentary {
  return {
    id: row.id,
    name: row.name,
    tableName: row.table_name,
    shortCode: row.short_code,
    title: row.title ?? undefined,
    description: row.description ?? undefined,
  };
}

function mapCommentaryEntry(row: CommentaryEntryRow): CommentaryEntry {
  return {
    bookNumber: row.book_number,
    chapterNumberFrom: row.chapter_number_from ?? undefined,
    chapterNumberTo: row.chapter_number_to ?? undefined,
    verseNumberFrom: row.verse_number_from ?? undefined,
    verseNumberTo: row.verse_number_to ?? undefined,
    marker: row.marker ?? undefined,
    text: row.text ?? "",
  };
}

export class SupabaseCommentaryService implements CommentaryService {
  constructor(private readonly client: SupabaseClient) {}

  /** Memoized commentary-books fetch — matches Flutter's cached provider. */
  private versionsCache: Promise<Commentary[]> | null = null;

  getCommentaryVersions(): Promise<Commentary[]> {
    if (!this.versionsCache) {
      // `Promise.resolve` adapts the Supabase thenable builder into a real
      // Promise so the memoized field keeps a clean Promise type.
      this.versionsCache = Promise.resolve(
        this.client.from("commentaries").select().order("name"),
      ).then((response) => unwrap(response).map(mapCommentary));
    }
    return this.versionsCache;
  }

  private async tableForCommentary(commentaryId: string): Promise<string> {
    const versions = await this.getCommentaryVersions();
    const commentary = versions.find((entry) => entry.id === commentaryId);
    if (!commentary) {
      throw new Error(`[bible] unknown commentary: ${commentaryId}`);
    }
    return commentary.tableName;
  }

  async getCommentaries(
    commentaryId: string,
    bookNumber: number,
    chapter: number,
  ): Promise<CommentaryEntry[]> {
    const table = await this.tableForCommentary(commentaryId);
    const response = await this.client
      .from(table)
      .select()
      .eq("book_number", bookNumber)
      .eq("chapter_number_from", chapter);
    return unwrap(response).map(mapCommentaryEntry);
  }

  async hasContent(commentaryId: string): Promise<boolean> {
    const table = await this.tableForCommentary(commentaryId);
    const response = await this.client.from(table).select("id").limit(1);
    return (unwrap(response) as unknown[]).length > 0;
  }
}
