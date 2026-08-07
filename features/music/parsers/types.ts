/**
 * Lyrics render-tree node model — the Music feature's counterpart to the
 * Bible module's Verse Rendering Engine node types
 * (`features/bible/parsers/types.ts`). Components consume an already-parsed
 * render tree and never re-parse raw lyric text.
 *
 * Example input line:
 *   [G]अनि परमेश्वरले भन्नुभयो[C]
 * parses to a `LyricsLineNode` whose `nodes` alternate chord and text
 * segments; the chord text is already transposed by the engine.
 */

/** A single chord/lyric segment on a line. */
export type LyricsInlineNode =
  | { type: "chord"; chord: string; lyric: string }
  | { type: "text"; text: string };

/** A parsed line (one physical line of the raw lyrics). */
export interface LyricsLineNode {
  type: "line";
  nodes: LyricsInlineNode[];
}

/** A stanza / block of consecutive lines (separated by blank lines). */
export interface LyricsBlockNode {
  type: "block";
  lines: LyricsLineNode[];
}

/**
 * The full render tree for one song surface (the web equivalent of
 * `CustomChordWidget`'s computed `lines`). Carries the song header facts so
 * the reader component stays presentational.
 */
export interface LyricsRenderTree {
  type: "lyrics";
  title: string;
  mainChord?: string;
  beat?: string;
  language: "np" | "en";
  transpose: number;
  blocks: LyricsBlockNode[];
}
