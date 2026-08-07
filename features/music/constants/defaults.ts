import type { LyricsLanguage } from "../types";

/**
 * Defaults for the Music feature — the web equivalents of the Flutter
 * initial values.
 *
 * - `DEFAULT_LYRICS_LANGUAGE` / `DEFAULT_SHOW_CHORDS` / `DEFAULT_TRANSPOSE`:
 *   initial values of `LyricsLanguageNotifier` (np), `ChordsNotifier`
 *   (true) and `ChordsTransposeNotifier` (0).
 * - `DEFAULT_SONG_READER_FONT_SIZE`: the song reader's initial font size.
 *   Flutter reads the global `settingsProvider.fontSize`; the web keeps an
 *   independent persisted `music.song-settings` store, so this default is
 *   defined here and reconciled with the shared reader preference during
 *   implementation.
 * - `UNKNOWN_ARTIST`: the web equivalent of `Artist.empty()` (used while an
 *   artist-linked song's artist is still loading).
 */
export const DEFAULT_LYRICS_LANGUAGE: LyricsLanguage = "np";
export const DEFAULT_SHOW_CHORDS = true;
export const DEFAULT_TRANSPOSE = 0;

/**
 * Song reader font size — a direct port of the Flutter global setting
 * (`Setting.initial().fontSize` = 21.0, dropdown range 12–30 in
 * `font_size_selection_dropdown.dart`).
 */
export const DEFAULT_SONG_READER_FONT_SIZE = 21;
export const SONG_READER_FONT_SIZE_MIN = 12;
export const SONG_READER_FONT_SIZE_MAX = 30;

/**
 * AppBar title fallback for `others` (artist-linked) songs when no artist is
 * known — a direct port of `MusicLanded`'s `artist?.name ?? "Artist"`.
 */
export const READER_TITLE_ARTIST_FALLBACK = "Artist";

export const UNKNOWN_ARTIST = {
  id: "",
  name: "Unknown Artist",
  lastUpdated: new Date(0).toISOString(),
} as const;

/**
 * Songs list page size — a direct port of `MusicNotifier._pageSize` (50).
 * Infinite scroll fetches this many rows per page; `hasMore` is derived from
 * a full page being returned (same heuristic as Flutter).
 */
export const SONG_PAGE_SIZE = 50;
