import type { LyricsLanguage, Song } from "../types";
import { lyricsForLanguage } from "./reading";

/**
 * Song text formatter — the web equivalent of the regex used by `ShareCopy`
 * to strip markup for plain-text copy/share.
 *
 * The Flutter Music feature itself has NO copy/share UI (the `ShareCopy`
 * helper is Bible-only), so these helpers are the reserved surface for a
 * future song copy/share action that reuses the shared copy/share
 * infrastructure (see `features/music/README.md` → Copy/share).
 *
 * Search matching lives in `utils/search.ts` (no duplication).
 */

/**
 * Strips `[chord]` markers and HTML-like tags from a lyric string — a direct
 * port of `ShareCopy`'s `replaceAll(RegExp(r'<[^>]*>'), '')` +
 * `replaceAll(RegExp(r'\[.*?\]'), '')` + `trim()`.
 */
export function stripChordBrackets(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/\[[^\]]*\]/g, "")
    .trim();
}

/**
 * Builds the plain-text song body used for copy/share: the lyrics (chords
 * stripped) for the given language, defaulting to Nepali. This is the song
 * equivalent of `ShareCopy.copyVerse`/`shareVerse`'s parsed text.
 */
export function songToPlainText(
  song: Song,
  options?: { language?: LyricsLanguage },
): string {
  return stripChordBrackets(lyricsForLanguage(song, options?.language ?? "np"));
}
