import {
  CHORD_BRACKET_GLOBAL_PATTERN,
  CHORD_FLAT_SCALE,
  CHORD_ROOT_PATTERN,
  CHORD_SHARP_SCALE,
  DEFAULT_LYRICS_LANGUAGE,
} from "../constants";
import type { LyricsLanguage, Song } from "../types";
import { lyricsForLanguage } from "./reading";

/**
 * Chord transposer — a direct port of the Flutter `ChordTransposer`
 * (`lib/helpers/chord_transposer.dart`). Pure and framework-free so it is
 * unit-testable and shared between the lyrics engine, the song settings
 * surface and any future transposition UI.
 *
 * Scales come from `constants/chords.ts` (`CHORD_SHARP_SCALE`,
 * `CHORD_FLAT_SCALE`); by default chords are spelled with sharps, exactly
 * like Flutter's `preferFlat: false`.
 */

/** Normalizes an index into `[0, 12)` after adding `steps` (Flutter's
 * `newIndex < 0 ? newIndex + 12 : newIndex`, generalized for any sign). */
function normalizeIndex(index: number, steps: number): number {
  return ((index + steps) % 12 + 12) % 12;
}

/**
 * Transposes a single chord (e.g. `"G"` → `"A"`), including slash chords
 * (`"D/F#"` → `"E/G#"`). Unknown chords are returned unchanged.
 */
export function transposeChord(
  chord: string,
  steps: number,
  options?: { preferFlat?: boolean },
): string {
  const preferFlat = options?.preferFlat ?? false;
  if (chord.length === 0) return chord;

  // Slash chords (e.g. D/F#): transpose each part and rejoin.
  if (chord.includes("/")) {
    return chord
      .split("/")
      .map((part) => transposeChord(part, steps, { preferFlat }))
      .join("/");
  }

  const match = CHORD_ROOT_PATTERN.exec(chord);
  if (!match) return chord;
  const root = match[1];
  const suffix = match[2] ?? "";

  const scale = preferFlat ? CHORD_FLAT_SCALE : CHORD_SHARP_SCALE;
  const altScale = preferFlat ? CHORD_SHARP_SCALE : CHORD_FLAT_SCALE;

  let index = scale.indexOf(root);
  if (index === -1) {
    // Root spelled in the other scale (e.g. "Bb" when preferFlat is false):
    // transpose from that scale, render in the preferred scale.
    index = altScale.indexOf(root);
    if (index === -1) return chord;
    return scale[normalizeIndex(index, steps)] + suffix;
  }
  return scale[normalizeIndex(index, steps)] + suffix;
}

/**
 * Transposes every inline `[chord]` in a lyric line by `steps` semitones.
 * When `preferFlat` is true the result uses flat spellings (e.g. `Bb`
 * instead of `A#`).
 */
export function transposeLyricLine(
  text: string,
  steps: number,
  options?: { preferFlat?: boolean },
): string {
  return text.replace(
    CHORD_BRACKET_GLOBAL_PATTERN,
    (_match, chord: string) => `[${transposeChord(chord, steps, options)}]`,
  );
}

/**
 * Transposes a song's selected lyric text (Nepali by default, or the
 * language given in `options.language`) by `steps` semitones. Web-first
 * convenience: `CustomChordWidget` computes the same thing inline from the
 * language + transpose settings.
 */
export function transposeSong(
  song: Song,
  steps: number,
  options?: { language?: LyricsLanguage; preferFlat?: boolean },
): string {
  const language = options?.language ?? DEFAULT_LYRICS_LANGUAGE;
  return transposeLyricLine(
    lyricsForLanguage(song, language),
    steps,
    { preferFlat: options?.preferFlat },
  );
}
