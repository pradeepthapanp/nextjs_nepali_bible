import type { ChordSegment, LyricsLanguage, Song } from "../types";
import { lyricsForLanguage, transposeLyricLine } from "../utils";
import { parseChordLine } from "./chord-lyrics-parser";
import type {
  LyricsBlockNode,
  LyricsInlineNode,
  LyricsLineNode,
  LyricsRenderTree,
} from "./types";

/**
 * Lyrics engine — the Music feature's counterpart to the Bible module's
 * `parseChapter` pipeline. It turns a raw lyric string (with inline
 * `[chords]`) into a `LyricsRenderTree` that components render directly.
 *
 * Pipeline (each step a direct port of the Flutter reader logic):
 *   1. pick the lyric source by language: `np` → `Song.nepaliLyrics`,
 *      `en` → `Song.translitLyrics` ("Roman lyrics")
 *      (mirrors `CustomChordWidget`'s `lyricsLanguage` branch).
 *   2. transpose every inline chord by `options.transpose`
 *      (mirrors `ChordTransposer.transposeLyricLine` with `preferFlat: false`).
 *   3. split into lines/blocks and run `parseChordLine` per line
 *      (mirrors the `lines` mapping in `CustomChordWidget`).
 *   4. carry the title / main chord / beat header so the reader stays
 *      presentational.
 */

/**
 * Splits a lyric string into stanzas: consecutive non-empty lines form a
 * block; a blank line starts a new block (and is itself dropped). This is a
 * render-tree refinement — Flutter renders each non-empty line sequentially
 * and skips empty parts, so the visible line order is identical.
 */
export function splitLyricBlocks(raw: string): string[][] {
  const blocks: string[][] = [];
  let current: string[] = [];
  for (const line of raw.split("\n")) {
    if (line.trim().length === 0) {
      if (current.length > 0) {
        blocks.push(current);
        current = [];
      }
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) blocks.push(current);
  return blocks;
}

/** Converts one `ChordSegment` into a render-tree inline node. */
function toInlineNodes(segments: ChordSegment[]): LyricsInlineNode[] {
  return segments.map((segment) =>
    segment.chord
      ? { type: "chord", chord: segment.chord, lyric: segment.lyric }
      : { type: "text", text: segment.lyric },
  );
}

/** Builds a stanza render-tree node from its raw lines. */
function toBlock(lines: string[]): LyricsBlockNode {
  const lineNodes: LyricsLineNode[] = lines.map((line) => ({
    type: "line",
    nodes: toInlineNodes(parseChordLine(line)),
  }));
  return { type: "block", lines: lineNodes };
}

/**
 * Parses a song into a `LyricsRenderTree` for the given language and
 * transpose. Pure: given the same song + options it always returns the same
 * tree.
 */
export function parseLyrics(
  song: Song,
  options: { language: LyricsLanguage; transpose: number },
): LyricsRenderTree {
  const rawLyrics = lyricsForLanguage(song, options.language);
  const processed = transposeLyricLine(rawLyrics, options.transpose, {
    preferFlat: false,
  });

  return {
    type: "lyrics",
    title: song.name ?? "",
    mainChord: song.mainChords ?? undefined,
    beat: song.beat ?? undefined,
    language: options.language,
    transpose: options.transpose,
    blocks: splitLyricBlocks(processed).map(toBlock),
  };
}
