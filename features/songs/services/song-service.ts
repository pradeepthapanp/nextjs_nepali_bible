import type { SupabaseClient } from "@supabase/supabase-js";
import { unwrap } from "@/services/helpers";
import type { Audio } from "../types";

/**
 * Song service — a direct port of the SupabaseRepository audio methods
 * (`fetchAudios`, `getAudio`, `insertAudio`, `updateAudio`, `deleteAudio`,
 * `incrementPlayCount`, `fetchAudioCategories`) from
 * `lib/providers/supabase/supabase_repository_provider.dart`. Uses the
 * existing `audios` table with no schema changes.
 */

export interface SongService {
  /** Paginated audios, newest first (replaces `fetchAudios`). */
  getAudios(options: { limit: number; offset: number }): Promise<Audio[]>;
  /** A single audio by id (replaces `getAudio`). */
  getAudio(id: string): Promise<Audio | null>;
  /** Create an audio row (replaces `insertAudio`). */
  createAudio(audio: Audio): Promise<void>;
  /** Update an audio row (replaces `updateAudio`). */
  updateAudio(audio: Audio): Promise<void>;
  /** Delete an audio row (replaces `deleteAudio`). */
  deleteAudio(id: string): Promise<void>;
  /** Optimistic play-count bump (replaces `incrementPlayCount`). */
  incrementPlayCount(id: string): Promise<void>;
  /** Distinct, sorted categories (replaces `fetchAudioCategories`). */
  getCategories(): Promise<string[]>;
}

/** An `audios` row as returned by Supabase (snake_case columns). */
interface AudioRow {
  id: string;
  title: string;
  artist: string | null;
  description: string | null;
  audio_url: string;
  art_url: string | null;
  category: string | null;
  play_count: number | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Maps an `audios` row to the domain `Audio` (mirrors `Audio.fromMap`). */
export function mapAudio(row: AudioRow): Audio {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist ?? undefined,
    description: row.description ?? undefined,
    audioUrl: row.audio_url,
    artUrl: row.art_url ?? undefined,
    category: row.category ?? undefined,
    playCount: row.play_count ?? 0,
    uploadedBy: row.uploaded_by ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseSongService implements SongService {
  constructor(private readonly client: SupabaseClient) {}

  async getAudios(options: { limit: number; offset: number }): Promise<Audio[]> {
    const response = await this.client
      .from("audios")
      .select()
      .order("created_at", { ascending: false })
      .range(options.offset, options.offset + options.limit - 1);
    const rows = unwrap(response) as AudioRow[] | null;
    return (rows ?? []).map(mapAudio);
  }

  async getAudio(id: string): Promise<Audio | null> {
    const response = await this.client
      .from("audios")
      .select()
      .eq("id", id)
      .maybeSingle();
    const row = unwrap(response) as AudioRow | null;
    return row ? mapAudio(row) : null;
  }

  async createAudio(audio: Audio): Promise<void> {
    const response = await this.client.from("audios").insert({
      title: audio.title,
      artist: audio.artist ?? null,
      description: audio.description ?? null,
      audio_url: audio.audioUrl,
      art_url: audio.artUrl ?? null,
      category: audio.category ?? null,
      play_count: audio.playCount,
      uploaded_by: audio.uploadedBy ?? null,
    });
    unwrap(response);
  }

  async updateAudio(audio: Audio): Promise<void> {
    const response = await this.client
      .from("audios")
      .update({
        title: audio.title,
        artist: audio.artist ?? null,
        description: audio.description ?? null,
        audio_url: audio.audioUrl,
        art_url: audio.artUrl ?? null,
        category: audio.category ?? null,
        play_count: audio.playCount,
      })
      .eq("id", audio.id);
    unwrap(response);
  }

  async deleteAudio(id: string): Promise<void> {
    const response = await this.client.from("audios").delete().eq("id", id);
    unwrap(response);
  }

  async incrementPlayCount(id: string): Promise<void> {
    const current = await this.getAudio(id);
    if (!current) return;
    const response = await this.client
      .from("audios")
      .update({ play_count: current.playCount + 1 })
      .eq("id", id);
    unwrap(response);
  }

  async getCategories(): Promise<string[]> {
    const response = await this.client
      .from("audios")
      .select("category")
      .not("category", "is", null);
    const rows = unwrap(response) as Array<{ category: string }> | null;
    const categories = [...new Set((rows ?? []).map((row) => row.category))];
    return categories.sort((a, b) => a.localeCompare(b));
  }
}
