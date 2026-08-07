import { RECENT_SEARCHES_MAX, SONG_SEARCH_TOKEN_PATTERN } from "../constants";
import type { Song } from "../types";

/**
 * Song search helpers — normalization, tokenization and client-side matching.
 *
 * - `normalizeSongQuery` is the counterpart to the Bible module's
 *   `normalizeSearchQuery`; it keeps the query consistent before it is used
 *   in cache keys and service calls.
 * - `songMatchesQuery` is a faithful port of `Music.matchesQuery` (single
 *   substring across every text field, case-insensitive).
 * - `tokenizeSongQuery` / `songMatchesTokens` are web-first additions for
 *   token (AND) matching; the Flutter app only ever matched the full query
 *   as one substring.
 */

/** Trims and lowercases a search query. */
export function normalizeSongQuery(query: string): string {
  return query.trim().toLowerCase();
}

/** Splits a normalized query into tokens on whitespace/punctuation. */
export function tokenizeSongQuery(query: string): string[] {
  return normalizeSongQuery(query).split(SONG_SEARCH_TOKEN_PATTERN).filter(Boolean);
}

/**
 * The searchable text fields of a song — a direct port of the field list in
 * the `Music` extension (`matchesQuery`): name, artist, description,
 * nepali_lyrics, roman_lyrics, translit_lyrics, song_number. Only non-empty
 * fields are returned.
 */
export function songSearchableFields(song: Song): string[] {
  return [
    song.name,
    song.artist,
    song.description,
    song.nepaliLyrics,
    song.romanLyrics,
    song.translitLyrics,
    song.songNumber,
  ].filter((field): field is string => Boolean(field));
}

/**
 * Client-side substring match — a direct port of `Music.matchesQuery`.
 * Returns true for an empty query (matches everything).
 */
export function songMatchesQuery(song: Song, query: string): boolean {
  const q = normalizeSongQuery(query);
  if (!q) return true;
  return songSearchableFields(song).some((field) =>
    field.toLowerCase().includes(q),
  );
}

/**
 * Token (AND) matching — every query token must appear in at least one of
 * the song's searchable fields. Web-first refinement for multi-word search;
 * `songMatchesQuery` remains the faithful single-substring port.
 */
export function songMatchesTokens(song: Song, tokens: string[]): boolean {
  if (tokens.length === 0) return true;
  const fields = songSearchableFields(song).map((field) => field.toLowerCase());
  return tokens.every((token) =>
    fields.some((field) => field.includes(token)),
  );
}

/**
 * Appends a normalized query to a most-recent-first recent-search list,
 * deduped and capped at `max`. Pure so the search hook stays thin.
 */
export function pushRecentSearch(
  recent: string[],
  query: string,
  max: number = RECENT_SEARCHES_MAX,
): string[] {
  const normalized = normalizeSongQuery(query);
  if (!normalized) return recent;
  const next = [normalized, ...recent.filter((entry) => entry !== normalized)];
  return next.slice(0, max);
}
