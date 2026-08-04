/**
 * Commentary models. Mirrors the Flutter `Commentary` (a commentary book) and
 * `Cmt` (one entry) models (`lib/models/commentary.dart`, `lib/models/cmt_model.dart`).
 */

/** A commentary book (e.g. William MacDonald — Believer's Bible Commentary). */
export interface Commentary {
  id: string;
  name: string;
  /** The Supabase table that stores this commentary's entries. */
  tableName: string;
  shortCode: string;
  title?: string;
  description?: string;
}

/** One commentary entry (a paragraph/section covering a verse range). */
export interface CommentaryEntry {
  bookNumber: number;
  /** Chapter range the entry anchors to (`chapter_number_from`/`chapter_number_to`). */
  chapterNumberFrom?: number;
  chapterNumberTo?: number;
  /** Verse range the entry anchors to. */
  verseNumberFrom?: number;
  verseNumberTo?: number;
  /** Optional marker text shown beside the verse number. */
  marker?: string | number;
  /** Entry body — may contain HTML/markup, parsed by commentary-parser. */
  text: string;
}
