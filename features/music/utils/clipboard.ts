import type { LyricsLanguage, Song } from "../types";
import { capitalizeWords } from "./capitalize";
import { lyricsForLanguage } from "./reading";
import { stripChordBrackets } from "./song-text";

/**
 * Clipboard formatter — builds the plain-text block for the "copy song"
 * action. The Flutter Music feature has no copy/share UI (the `ShareCopy`
 * helper is Bible-only), so this is a web-first, pure formatter that reuses
 * the same helpers the Bible module uses to strip markup for clipboard text.
 *
 * Output shape:
 *   <Song name>
 *   <Category> · <song number> · Key: <main chord> · Beat: <beat>
 *
 *   <lyrics with chord brackets removed>
 */

/** Builds the clipboard block for a song (defaults to Nepali lyrics). */
export function songToClipboardText(
  song: Song,
  options?: { language?: LyricsLanguage },
): string {
  const lines: string[] = [];
  if (song.name) lines.push(song.name);

  const meta = [
    song.category ? capitalizeWords(song.category) : undefined,
    song.songNumber,
    song.mainChords ? `Key: ${song.mainChords}` : undefined,
    song.beat ? `Beat: ${song.beat}` : undefined,
  ].filter((part): part is string => Boolean(part));
  if (meta.length > 0) lines.push(meta.join(" · "));

  const lyrics = stripChordBrackets(
    lyricsForLanguage(song, options?.language ?? "np"),
  );
  if (lyrics) lines.push("", lyrics);

  return lines.join("\n").trim();
}
