/**
 * Chord scales, transpose bounds and regexes — the pure, framework-free facts
 * that back the chord transposer (`features/music/utils/chord-transposer.ts`)
 * and the chord parser (`features/music/parsers/chord-lyrics-parser.ts`).
 *
 * Direct ports of the constants embedded in the Flutter
 * `ChordTransposer` (`lib/helpers/chord_transposer.dart`).
 */

/** The chromatic scale rendered with sharps (the default rendering). */
export const CHORD_SHARP_SCALE: readonly string[] = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

/** The chromatic scale rendered with flats (used when `preferFlat`). */
export const CHORD_FLAT_SCALE: readonly string[] = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];

/** Matches an inline chord, e.g. `[G]` or `[C#m7]`. */
export const CHORD_BRACKET_PATTERN = /\[([^\]]+)\]/;

/** Global variant of `CHORD_BRACKET_PATTERN` (required by `String.matchAll`
 * and `String.replace` to match every chord in a line). */
export const CHORD_BRACKET_GLOBAL_PATTERN = /\[([^\]]+)\]/g;

/** Splits a chord into its root (`G`, `Bb`, `C#`) and suffix (`m7`, `sus4`…). */
export const CHORD_ROOT_PATTERN = /^([A-G][b#]?)(.*)$/;

/**
 * Transpose bounds — a web refinement. Flutter's `ChordsTransposeNotifier`
 * does not clamp (`+1`/`-1` indefinitely); the web clamps to a chromatic
 * octave so the transpose is always meaningful.
 */
export const TRANSPOSE_MIN = -11;
export const TRANSPOSE_MAX = 11;

/**
 * Artist photo fallback used when an artist has no `photoUrl` (matches the
 * Flutter placeholder URL in `song_leading_widget.dart` /
 * `artists_page.dart`).
 */
export const ARTIST_PLACEHOLDER_IMAGE =
  "https://api.sgmbiblezone.com/storage/v1/object/public/resources/artist_placeholder.png";
