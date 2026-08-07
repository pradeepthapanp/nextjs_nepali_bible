import { CHORD_BRACKET_GLOBAL_PATTERN } from "../constants";
import type { ChordSegment } from "../types";

/**
 * Chord/lyric line parser — a direct port of `LyricChordParser.parseLine`
 * (`lib/music/widgets/chord_parser.dart`).
 *
 * Splits one physical line into an ordered list of `ChordSegment`s using the
 * inline `[chord]` bracket pattern (`constants/chords.ts`
 * `CHORD_BRACKET_GLOBAL_PATTERN`). Plain lyric before the first chord and
 * after the last chord becomes a segment with an empty `chord`.
 *
 *   "[G]अनि[C] परमेश्वरले" →
 *     [{ chord: "G", lyric: "अनि" },
 *      { chord: "C", lyric: " परमेश्वरले" }]
 *
 * A line with no chords yields a single segment `{ chord: "", lyric: line }`.
 * A blank line yields `[]`.
 */
export function parseChordLine(line: string): ChordSegment[] {
  const matches = Array.from(line.matchAll(CHORD_BRACKET_GLOBAL_PATTERN));
  const result: ChordSegment[] = [];
  let currentIndex = 0;

  for (const match of matches) {
    const chord = match[1];
    const chordStart = match.index ?? 0;
    const lyricStart = chordStart + match[0].length;

    // Plain lyric before this chord.
    if (chordStart > currentIndex) {
      result.push({ chord: "", lyric: line.slice(currentIndex, chordStart) });
    }

    // The lyric that belongs to this chord runs until the next chord.
    const next = matches.find((candidate) => (candidate.index ?? 0) > chordStart);
    const lyricEnd = next ? (next.index ?? 0) : line.length;
    result.push({ chord, lyric: line.slice(lyricStart, lyricEnd) });
    currentIndex = lyricEnd;
  }

  // Remaining plain lyric after the last chord.
  if (currentIndex < line.length) {
    result.push({ chord: "", lyric: line.slice(currentIndex) });
  }

  return result;
}
