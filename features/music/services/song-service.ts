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
 * orders it lexicographically (`1, 10, 100, 2, …`) and cannot produce a
 * NUMERICALLY-correct page on its own. Every list method therefore fetches
 * only the LIGHT index columns (`id`, `category`, `song_number`), applies
 * the SHARED `orderSongs` (category asc, then NUMERIC `song_number`) ONCE
 * (cached per session), then fetches FULL rows only for the requested page
 * (50 at a time) — so `99` sorts before `100`, the initial load is small,
 * and every consumer (category lists, artist lists, search results, Song
 * Reader source lists) sees the SAME order. Playlists are NOT reordered
 * here: they keep their user-defined `position` order
 * (`fetchPlaylistSongs` in `playlist-song-service.ts`).
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
 * A LIGHT `songs` index row — only the columns needed for numeric ordering
 * (`id`, `category`, `song_number`). Fetching this instead of full rows
 * keeps the ordering index tiny while lyrics etc. load per page.
 */
interface SongIndexRow {
  id: string;
  category: string | null;
  song_number: string | null;
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
   * Cached NUMERICALLY-ORDERED song id lists, keyed by set ("all",
   * "cat:<category>", "artist:<id>", "search:<query>"). Only the tiny index
   * columns (`id`, `category`, `song_number`) are fetched to compute the
   * order; the heavy rows (lyrics etc.) are then fetched per page (50 at a
   * time). `songs.song_number` is TEXT, so PostgREST cannot order it
   * numerically — the shared `orderSongs` sort runs over this small index
   * ONCE per session. `updateSong` clears it (single admin write path).
   * These live on the `getMusicServices()` singleton in the browser;
   * server-side callers use fresh `createMusicServices` instances (e.g. the
   * sitemap) and are unaffected.
   */
  private readonly orderedIdsCache = new Map<string, string[]>();

  /** Drops the cached ordering index (called by `updateSong`). */
  private clearCaches(): void {
    this.orderedIdsCache.clear();
  }

  /**
   * Fetches the LIGHT ordering index (id/category/song_number) for a set,
   * applies the SINGLE shared numeric `orderSongs`, and caches the ordered
   * ids. Paged in PostgREST's max-rows chunks (an unbounded `.select()`
   * caps at 1000 rows). The caller supplies a `fetchPage` that builds the
   * light select for its set.
   */
  private async orderedIdsFor(
    key: string,
    fetchPage: (
      from: number,
      to: number,
    ) => PromiseLike<{ data: SongIndexRow[] | null; error: unknown }>,
  ): Promise<string[]> {
    const cached = this.orderedIdsCache.get(key);
    if (cached) return cached;
    const CHUNK = 1000;
    const all: SongIndexRow[] = [];
    for (let offset = 0; ; offset += CHUNK) {
      const response = await fetchPage(offset, offset + CHUNK - 1);
      const rows = (unwrap(response) ?? []) as SongIndexRow[];
      all.push(...rows);
      if (rows.length < CHUNK) break;
    }
    const ordered = orderSongs(
      all.map((row) => ({
        id: row.id,
        category: (row.category as SongCategoryName) ?? undefined,
        songNumber: row.song_number ?? undefined,
      })),
    );
    const ids = ordered.map((entry) => entry.id);
    this.orderedIdsCache.set(key, ids);
    return ids;
  }

  /**
   * Fetches FULL rows only for the given ids and returns them in the given
   * (already numerically-ordered) id order — `.in()` returns rows in no
   * particular order, so the result is re-keyed by id.
   */
  private async fetchRowsByIds(ids: string[]): Promise<Song[]> {
    if (ids.length === 0) return [];
    const response = await this.client.from("songs").select().in("id", ids);
    const rows = (unwrap(response) ?? []) as SongRow[];
    const byId = new Map(rows.map((row) => [row.id, mapSong(row)]));
    return ids
      .map((id) => byId.get(id))
      .filter((song): song is Song => Boolean(song));
  }

  /**
   * Fetches the page's full rows: order the LIGHT index once (cached), then
   * load only this page's rows. `orderSongs` is authoritative so the numeric
   * `song_number` order is correct across pages.
   */
  async getSongs(page: number, pageSize = SONG_PAGE_SIZE): Promise<Song[]> {
    const [from, to] = rangeFor(page, pageSize);
    const ids = await this.orderedIdsFor("all", (offset, end) =>
      this.client
        .from("songs")
        .select("id, category, song_number")
        .order("category")
        .order("song_number")
        .range(offset, end),
    );
    return this.fetchRowsByIds(ids.slice(from, to + 1));
  }

  async getSongsByCategory(
    category: SongCategoryName,
    page: number,
    pageSize = SONG_PAGE_SIZE,
  ): Promise<Song[]> {
    const [from, to] = rangeFor(page, pageSize);
    const ids = await this.orderedIdsFor(`cat:${category}`, (offset, end) =>
      this.client
        .from("songs")
        .select("id, category, song_number")
        .eq("category", category)
        .order("song_number")
        .range(offset, end),
    );
    return this.fetchRowsByIds(ids.slice(from, to + 1));
  }

  async getSongsByArtist(artistId: string): Promise<Song[]> {
    const ids = await this.orderedIdsFor(`artist:${artistId}`, (offset, end) =>
      this.client
        .from("songs")
        .select("id, category, song_number")
        .eq("artist_id", artistId)
        .order("song_number")
        .range(offset, end),
    );
    return this.fetchRowsByIds(ids);
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
    // Matching semantics (relevance) are preserved by the ilike query above;
    // the light index is ordered by the shared numeric `orderSongs` before
    // the page's full rows are fetched.
    const ids = await this.orderedIdsFor(`search:${q}`, (offset, end) =>
      this.client
        .from("songs")
        .select("id, category, song_number")
        .or(
          `name.ilike.%${q}%,artist.ilike.%${q}%,nepali_lyrics.ilike.%${q}%,roman_lyrics.ilike.%${q}%,translit_lyrics.ilike.%${q}%,song_number.ilike.%${q}%`,
        )
        .order("category")
        .order("song_number")
        .range(offset, end),
    );
    return this.fetchRowsByIds(ids.slice(from, to + 1));
  }

  async updateSong(song: Song): Promise<void> {
    const response = await this.client
      .from("songs")
      .update(songToSupabaseMap(song))
      .eq("id", song.id);
    unwrap(response);
    // The edit changes ordering-relevant fields (category / song_number), so
    // the cached ordered lists are no longer valid.
    this.clearCaches();
  }
}
