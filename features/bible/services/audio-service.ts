import type { SupabaseClient } from "@supabase/supabase-js";
import type { BibleAudio } from "../types";
import { unwrap } from "./helpers";

/**
 * Audio Bible service — a direct port of the SupabaseRepository audio methods
 * (`fetchBibleAudio`, `fetchBookAudios`). Reads the existing `nnrv_audios`
 * table (audio is bound to the NNRV version) with no schema changes.
 */

export interface AudioService {
  /** The audio track for one chapter (replaces `fetchBibleAudio`). */
  getChapterAudio(
    bookNumber: number,
    chapter: number,
  ): Promise<BibleAudio | null>;
  /** All audio tracks for a book (replaces `fetchBookAudios`). */
  getBookAudios(bookNumber: number): Promise<BibleAudio[]>;
}

interface BibleAudioRow {
  id: string;
  book_number: number;
  chapter: number;
  short_name: string;
  long_name: string;
  audio_url: string;
  created_at: string | null;
}

function mapBibleAudio(row: BibleAudioRow): BibleAudio {
  return {
    id: row.id,
    bookNumber: row.book_number,
    chapter: row.chapter,
    shortName: row.short_name,
    longName: row.long_name,
    audioUrl: row.audio_url,
    createdAt: row.created_at ?? undefined,
  };
}

export class SupabaseAudioService implements AudioService {
  constructor(private readonly client: SupabaseClient) {}

  async getChapterAudio(
    bookNumber: number,
    chapter: number,
  ): Promise<BibleAudio | null> {
    const response = await this.client
      .from("nnrv_audios")
      .select()
      .eq("book_number", bookNumber)
      .eq("chapter", chapter)
      .maybeSingle();
    const row = unwrap(response) as BibleAudioRow | null;
    return row ? mapBibleAudio(row) : null;
  }

  async getBookAudios(bookNumber: number): Promise<BibleAudio[]> {
    const response = await this.client
      .from("nnrv_audios")
      .select()
      .eq("book_number", bookNumber)
      .order("chapter");
    return unwrap(response).map(mapBibleAudio);
  }
}
