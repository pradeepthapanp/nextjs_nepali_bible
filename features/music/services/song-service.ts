import type { SupabaseClient } from "@supabase/supabase-js";
import { unwrap } from "@/services/helpers";
import { SONG_PAGE_SIZE } from "../constants";
import type { Song, SongCategoryName } from "../types";

/**
 * Song service — a direct port of the SupabaseRepository song methods
 * (`getSongs`, `getSongsByCategory`, `getSongsByArtist`, `searchSongs`,
 * `updateSong`) from `lib/providers/supabase/supabase_repository_provider.dart`.
 *
 * `SupabaseSongService` uses the existing `songs` table (no schema changes)
 * and is the implementation of the `SongService` contract. Server-state
 * queries reuse it via the `MusicServices` aggregate (see `index.ts`).
 *
 * Row mapping notes (mirroring Flutter):
 * - `getSongs` orders by `category` then `song_number`.
 * - `getSongsByCategory` filters `eq("category", …)` then orders by
 *   `song_number`.
 * - `getSongsByArtist` filters `eq("artist_id", …)` and orders by `name`.
 * - `searchSongs` matches `name | artist | nepali_lyrics | roman_lyrics |
 *   translit_lyrics | song_number` with `ilike:%q%` (see
 *   `constants/search.ts`) and orders by `category`, `song_number`.
 * - `getSongById` is a WEB-FIRST method (no Flutter counterpart): web deep
 *   links carry only a `songId`, so the Song Reader resolves a single song
 *   instead of receiving the whole list through a route `extra`.
 */
export interface SongService {
  /** Paginated songs for the whole library (replaces `getSongs`). */
  getSongs(page: number, pageSize?: number): Promise<Song[]>;

  /** Paginated songs for one category (replaces `getSongsByCategory`). */
  getSongsByCategory(
    category: SongCategoryName,
    page: number,
    pageSize?: number,
  ): Promise<Song[]>;

  /** All songs by an artist, ordered by name (replaces `getSongsByArtist`). */
  getSongsByArtist(artistId: string): Promise<Song[]>;

  /** A single song by id — WEB-FIRST (deep-link resolution). */
  getSongById(id: string): Promise<Song | null>;

  /** Paginated full-text-ish search (replaces `searchSongs`). */
  searchSongs(
    query: string,
    page: number,
    pageSize?: number,
  ): Promise<Song[]>;

  /** Admin only: persist a song edit (replaces `updateSong`). */
  updateSong(song: Song): Promise<void>;
}

/** A `songs` row as returned by Supabase (snake_case columns). */
interface SongRow {
  id: string;
  name: string | null;
  artist: string | null;
  artist_id: string | null;
  audio_url: string | null;
  description: string | null;
  nepali_lyrics: string | null;
  roman_lyrics: string | null;
  translit_lyrics: string | null;
  main_chords: string | null;
  beat: string | null;
  song_number: string | null;
  category: string | null;
  last_updated: string | null;
}

/**
 * Maps a `songs` row to the domain `Song` (mirrors `Music.fromMap`).
 * Exported so the playlist-song service reuses it (single mapping, no
 * duplication) instead of re-implementing the row → Song conversion.
 */
export function mapSong(row: SongRow): Song {
  return {
    id: row.id,
    name: row.name ?? undefined,
    artist: row.artist ?? undefined,
    artistId: row.artist_id ?? undefined,
    audioUrl: row.audio_url ?? undefined,
    description: row.description ?? undefined,
    nepaliLyrics: row.nepali_lyrics ?? undefined,
    romanLyrics: row.roman_lyrics ?? undefined,
    translitLyrics: row.translit_lyrics ?? undefined,
    mainChords: row.main_chords ?? undefined,
    beat: row.beat ?? undefined,
    songNumber: row.song_number ?? undefined,
    category: (row.category as SongCategoryName) ?? undefined,
    lastUpdated: row.last_updated ?? undefined,
  };
}

/** The write payload of `updateSong` (mirrors `Music.toSupabaseMap` — the
 * `last_updated` column is intentionally NOT sent, exactly like Flutter). */
function songToSupabaseMap(song: Song) {
  return {
    id: song.id,
    name: song.name ?? null,
    artist: song.artist ?? null,
    artist_id: song.artistId ?? null,
    audio_url: song.audioUrl ?? null,
    description: song.description ?? null,
    nepali_lyrics: song.nepaliLyrics ?? null,
    roman_lyrics: song.romanLyrics ?? null,
    translit_lyrics: song.translitLyrics ?? null,
    main_chords: song.mainChords ?? null,
    beat: song.beat ?? null,
    song_number: song.songNumber ?? null,
    category: song.category ?? null,
  };
}

/** 0-based inclusive pagination range (postgrest-js has no public offset). */
function rangeFor(page: number, pageSize: number): [number, number] {
  const from = page * pageSize;
  return [from, from + pageSize - 1];
}

export class SupabaseSongService implements SongService {
  constructor(private readonly client: SupabaseClient) {}

  async getSongs(page: number, pageSize = SONG_PAGE_SIZE): Promise<Song[]> {
    const [from, to] = rangeFor(page, pageSize);
    const response = await this.client
      .from("songs")
      .select()
      .order("category")
      .order("song_number")
      .range(from, to);
    return unwrap(response).map(mapSong);
  }

  async getSongsByCategory(
    category: SongCategoryName,
    page: number,
    pageSize = SONG_PAGE_SIZE,
  ): Promise<Song[]> {
    const [from, to] = rangeFor(page, pageSize);
    const response = await this.client
      .from("songs")
      .select()
      .eq("category", category)
      .order("song_number")
      .range(from, to);
    return unwrap(response).map(mapSong);
  }

  async getSongsByArtist(artistId: string): Promise<Song[]> {
    const response = await this.client
      .from("songs")
      .select()
      .eq("artist_id", artistId)
      .order("name", { ascending: true });
    return unwrap(response).map(mapSong);
  }

  async getSongById(id: string): Promise<Song | null> {
    const response = await this.client
      .from("songs")
      .select()
      .eq("id", id)
      .maybeSingle();
    const row = unwrap(response) as SongRow | null;
    return row ? mapSong(row) : null;
  }

  async searchSongs(
    query: string,
    page: number,
    pageSize = SONG_PAGE_SIZE,
  ): Promise<Song[]> {
    const q = query.trim();
    if (!q) return [];
    const [from, to] = rangeFor(page, pageSize);
    const response = await this.client
      .from("songs")
      .select()
      .or(
        `name.ilike.%${q}%,artist.ilike.%${q}%,nepali_lyrics.ilike.%${q}%,roman_lyrics.ilike.%${q}%,translit_lyrics.ilike.%${q}%,song_number.ilike.%${q}%`,
      )
      .order("category")
      .order("song_number")
      .range(from, to);
    return unwrap(response).map(mapSong);
  }

  async updateSong(song: Song): Promise<void> {
    const response = await this.client
      .from("songs")
      .update(songToSupabaseMap(song))
      .eq("id", song.id);
    unwrap(response);
  }
}
