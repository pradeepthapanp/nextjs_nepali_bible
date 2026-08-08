import type { SupabaseClient } from "@supabase/supabase-js";
import { unwrap } from "@/services/helpers";
import { SONG_PAGE_SIZE } from "../constants";
import type { Song, SongCategoryName } from "../types";
import { orderSongs } from "../utils/song-ordering";

/**
 * Song service — a direct port of the SupabaseRepository song methods
 * (`getSongs`, `getSongsByCategory`, `getSongsByArtist`, `searchSongs`,
 * `updateSong`) from `lib/providers/supabase/supabase_repository_provider.dart`.
 *
 * `SupabaseSongService` uses the existing `songs` table (no schema changes)
 * and is the implementation of the `SongService` contract. Server-state
 * queries reuse it via the `MusicServices` aggregate (see `index.ts`).
 *
 * ORDERING — single source of truth: `songs.song_number` is TEXT, so SQL
 * orders it lexicographically (`1, 10, 100, 2, …`). Every list method here
 * fetches its matching rows, maps them, applies the SHARED `orderSongs`
 * (category asc, then NUMERIC `song_number`) and then paginates in memory —
 * so `99` sorts before `100` and every consumer (category lists, artist
 * lists, search results, Song Reader source lists) sees the SAME order.
 * Playlists are NOT reordered here: they keep their user-defined `position`
 * order (`fetchPlaylistSongs` in `playlist-song-service.ts`).
 *
 * Row mapping notes (mirroring Flutter):
 * - `getSongs` / `getSongsByCategory` / `getSongsByArtist` / `searchSongs`
 *   all end with the shared numeric `orderSongs`.
 * - `searchSongs` matches `name | artist | nepali_lyrics | roman_lyrics |
 *   translit_lyrics | song_number` with `ilike:%q%` (see
 *   `constants/search.ts`) and preserves its category grouping before the
 *   numeric order.
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

  /** All songs by an artist, in the shared numeric order (replaces `getSongsByArtist`). */
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

  /**
   * Fetches EVERY row matching the caller's query by paging in PostgREST's
   * max-rows chunks (an unbounded `.select()` caps at 1000 rows, which would
   * silently truncate the library). Used by every list method so the shared
   * numeric ordering is computed over the FULL matching set — not a window.
   */
  private async fetchAllRows(
    fetchPage: (
      from: number,
      to: number,
    ) => PromiseLike<{ data: SongRow[] | null; error: unknown }>,
  ): Promise<SongRow[]> {
    const CHUNK = 1000;
    const all: SongRow[] = [];
    for (let offset = 0; ; offset += CHUNK) {
      const response = await fetchPage(offset, offset + CHUNK - 1);
      const rows = (unwrap(response) ?? []) as SongRow[];
      all.push(...rows);
      if (rows.length < CHUNK) break;
    }
    return all;
  }

  /**
   * Fetches the matching rows, maps them, applies the SINGLE shared numeric
   * ordering (`orderSongs`) and paginates in memory. The SQL query is only a
   * coarse pre-sort — `orderSongs` is authoritative so the numeric
   * `song_number` order is correct across pages.
   */
  async getSongs(page: number, pageSize = SONG_PAGE_SIZE): Promise<Song[]> {
    const [from, to] = rangeFor(page, pageSize);
    const rows = await this.fetchAllRows((offset, end) =>
      this.client
        .from("songs")
        .select()
        .order("category")
        .order("song_number")
        .range(offset, end),
    );
    const songs = orderSongs(rows.map(mapSong));
    return songs.slice(from, to + 1);
  }

  async getSongsByCategory(
    category: SongCategoryName,
    page: number,
    pageSize = SONG_PAGE_SIZE,
  ): Promise<Song[]> {
    const [from, to] = rangeFor(page, pageSize);
    const rows = await this.fetchAllRows((offset, end) =>
      this.client
        .from("songs")
        .select()
        .eq("category", category)
        .order("song_number")
        .range(offset, end),
    );
    const songs = orderSongs(rows.map(mapSong));
    return songs.slice(from, to + 1);
  }

  async getSongsByArtist(artistId: string): Promise<Song[]> {
    const rows = await this.fetchAllRows((offset, end) =>
      this.client
        .from("songs")
        .select()
        .eq("artist_id", artistId)
        .order("song_number")
        .range(offset, end),
    );
    return orderSongs(rows.map(mapSong));
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
    const rows = await this.fetchAllRows((offset, end) =>
      this.client
        .from("songs")
        .select()
        .or(
          `name.ilike.%${q}%,artist.ilike.%${q}%,nepali_lyrics.ilike.%${q}%,roman_lyrics.ilike.%${q}%,translit_lyrics.ilike.%${q}%,song_number.ilike.%${q}%`,
        )
        .order("category")
        .order("song_number")
        .range(offset, end),
    );
    // Matching semantics (relevance) are preserved by the query above; the
    // shared numeric order is applied to the matched set before pagination.
    const songs = orderSongs(rows.map(mapSong));
    return songs.slice(from, to + 1);
  }

  async updateSong(song: Song): Promise<void> {
    const response = await this.client
      .from("songs")
      .update(songToSupabaseMap(song))
      .eq("id", song.id);
    unwrap(response);
  }
}
