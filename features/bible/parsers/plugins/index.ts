import type { VerseParserPlugin } from "../types";
import { crossReferenceMarkersPlugin } from "./cross-ref-markers";
import { searchHighlightPlugin } from "./search-highlight";

export * from "./search-highlight";
export * from "./strongs";
export * from "./footnotes";
export * from "./inline-highlight";
export * from "./inline-notes";
export * from "./cross-ref-markers";

/**
 * The default plugin set applied when none is supplied. Future features are
 * added here (or appended per-call via `VerseParseOptions.plugins`) without
 * changing the engine or existing handlers.
 */
export const defaultPlugins: VerseParserPlugin[] = [
  crossReferenceMarkersPlugin,
  searchHighlightPlugin,
  // strongsPlugin,       // enable when Strong's markup lands
  // footnotesPlugin,     // enable when footnote markup lands
  // inlineNotesPlugin,   // enable when rich note markup lands
  // inlineHighlightPlugin, // enable when the inline-range API is built
];
