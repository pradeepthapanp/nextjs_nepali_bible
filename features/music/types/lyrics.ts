/**
 * Lyrics / chord domain model for the Song Reader.
 *
 * Raw lyrics are plain text where chords appear inline inside square
 * brackets, e.g.:
 *
 *   [G]अनि परमेश्वरले भन्नुभयो[C]
 *
 * `parseChordLine` splits such a line into `ChordSegment`s
 * (the Flutter `ChordLyricPair`), and `parseLyrics` (the lyrics engine in
 * `features/music/parsers/lyrics-engine.ts`) builds a render tree from them
 * so components never re-parse text.
 */

/** One chord+lyric pair on a line — a direct port of `ChordLyricPair`
 * (`lib/music/widgets/chord_lyrics_pair.dart`). `chord` is `""` for plain
 * lyric segments that precede/follow a chord. */
export interface ChordSegment {
  chord: string;
  lyric: string;
}

/** A parsed line of lyrics: an ordered list of chord/lyric segments. */
export interface ChordLine {
  segments: ChordSegment[];
}

/**
 * Lyrics language — a direct port of the Flutter `LyricsLanguage` enum
 * (`lib/providers/music/lyrics_language_provider.dart`).
 *
 *   np → `Song.nepaliLyrics`   en → `Song.translitLyrics` ("Roman lyrics")
 */
export type LyricsLanguage = "np" | "en";

