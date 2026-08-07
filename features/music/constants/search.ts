/**
 * Song search tuning.
 *
 * - `SONG_SEARCH_DEBOUNCE_MS`: direct port of the 400ms `Debouncer` in
 *   `music_display.dart`.
 * - `SONG_SEARCH_MIN_QUERY_LENGTH`: web refinement (the Flutter search fires
 *   on every non-empty query); mirrors `SEARCH_MIN_QUERY_LENGTH` in the Bible
 *   module to avoid noisy server queries.
 * - `SONG_SEARCH_FIELDS`: the columns matched by `searchSongs` (a direct port
 *   of the Supabase `or(...)` list in `supabase_repository_provider.dart`).
 */
export const SONG_SEARCH_DEBOUNCE_MS = 400;
export const SONG_SEARCH_MIN_QUERY_LENGTH = 2;

/** Max number of recent searches kept (most-recent-first, deduped). */
export const RECENT_SEARCHES_MAX = 8;

/**
 * Token separator used by `tokenizeSongQuery` (whitespace + common punctuation
 * in both Latin and Devanagari scripts). Web-first; Flutter only ever matched
 * the full query as one substring.
 */
export const SONG_SEARCH_TOKEN_PATTERN = /[\s,;.:!?，。、！？]+/;

export const SONG_SEARCH_FIELDS = [
  "name",
  "artist",
  "nepali_lyrics",
  "roman_lyrics",
  "translit_lyrics",
  "song_number",
] as const;
