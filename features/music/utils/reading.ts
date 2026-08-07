import {
  READER_TITLE_ARTIST_FALLBACK,
  SONG_READER_FONT_SIZE_MAX,
  SONG_READER_FONT_SIZE_MIN,
  TRANSPOSE_MAX,
  TRANSPOSE_MIN,
} from "../constants";
import type { LyricsLanguage, Song } from "../types";
import { capitalizeWords } from "./capitalize";

/**
 * Reading utilities — pure helpers for the Song Reader surface. These back
 * `useSongReader` / `useSongSettings` (which add React/Zustand) without
 * depending on them, so every function here is independently unit-testable.
 */

/** Clamps a value to `[min, max]`. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Clamps a transpose value to a chromatic octave
 * (`TRANSPOSE_MIN`..`TRANSPOSE_MAX`). Flutter does not clamp; this is a web
 * refinement so the transpose always maps onto the 12-note scale. */
export function clampTranspose(value: number): number {
  return clamp(value, TRANSPOSE_MIN, TRANSPOSE_MAX);
}

/** Clamps a reader font size to the Flutter dropdown range (12–30). */
export function clampFontSize(value: number): number {
  return clamp(value, SONG_READER_FONT_SIZE_MIN, SONG_READER_FONT_SIZE_MAX);
}

/** Formats a transpose amount for display ("0", "+2", "-1"). */
export function formatTranspose(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

/**
 * Picks the lyric source for a language — a direct port of
 * `CustomChordWidget`'s `lyricsLanguage == np ? nepaliLyrics : translitLyrics`
 * branch. `np` → Nepali lyrics, `en` → translit lyrics ("Roman lyrics").
 */
export function lyricsForLanguage(
  song: Song,
  language: LyricsLanguage,
): string {
  return language === "np" ? (song.nepaliLyrics ?? "") : (song.translitLyrics ?? "");
}

/**
 * Reader AppBar title — a direct port of `MusicLanded.build`'s title:
 *   - `others` (artist-linked) songs → the artist name, falling back to
 *     `READER_TITLE_ARTIST_FALLBACK` ("Artist");
 *   - everything else → "<CapitalizedCategory> <songNumber>" (e.g. "Bhajan 12");
 *   - if neither category nor number is present, falls back to the song name.
 */
export function readerTitle(song: Song, artistName?: string | null): string {
  if (song.category === "others") return artistName || READER_TITLE_ARTIST_FALLBACK;
  const category = song.category ? capitalizeWords(song.category) : "";
  const title = [category, song.songNumber].filter(Boolean).join(" ");
  return title || song.name || "";
}
