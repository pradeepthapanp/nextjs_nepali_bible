import type { Song } from "../types";

/**
 * Song ordering — THE single source of truth for how songs are ordered.
 *
 * The `songs.song_number` column is TEXT (verified), so Postgres/PostgREST
 * orders it LEXICOGRAPHICALLY (`1, 10, 100, 2, 20, …`). Numeric ordering is
 * not expressible through the existing `SupabaseClient.order()` API on a text
 * column (no cast), so the ordering is applied here, ONCE, after mapping —
 * every song list (category lists, artist lists, search results, and the Song
 * Reader source lists that reuse them) goes through this function.
 *
 * Rule: category ascending, then `song_number` NUMERICALLY (so `99` sorts
 * before `100`). Songs without a numeric `song_number` sort last (stable
 * tiebreak on the raw string).
 */

/** Parses a `song_number` to its numeric value; non-numeric/absent → largest. */
function numericSongNumber(value: string | undefined): number {
  if (value == null) return Number.POSITIVE_INFINITY;
  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
}

/** Numeric comparison of two `song_number` strings (stable raw-string tiebreak). */
export function compareSongNumbers(
  a: string | undefined,
  b: string | undefined,
): number {
  const an = numericSongNumber(a);
  const bn = numericSongNumber(b);
  if (an !== bn) return an - bn;
  return (a ?? "").localeCompare(b ?? "");
}

/**
 * Orders songs: category ascending, then numeric `song_number`.
 * Returns a NEW array (never mutates the input). This is the ONLY song
 * ordering used anywhere — components must not re-sort.
 */
export function orderSongs(songs: Song[]): Song[] {
  return [...songs].sort((a, b) => {
    const byCategory = (a.category ?? "").localeCompare(b.category ?? "");
    if (byCategory !== 0) return byCategory;
    return compareSongNumbers(a.songNumber, b.songNumber);
  });
}
