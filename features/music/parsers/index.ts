/**
 * Lyrics parsing public API.
 *
 *   raw lyrics → parseLyrics (transpose + language + stanza split)
 *              → LyricsRenderTree → components (future)
 *
 * Export surface:
 *   - `types`: the render-tree node model
 *   - `chord-lyrics-parser`: parseChordLine (port of LyricChordParser)
 *   - `lyrics-engine`: parseLyrics + splitLyricBlocks (port of
 *     CustomChordWidget line mapping)
 */

export * from "./types";
export * from "./chord-lyrics-parser";
export * from "./lyrics-engine";
