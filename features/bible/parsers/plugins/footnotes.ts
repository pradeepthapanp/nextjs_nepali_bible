import type { TagContext, VerseParserPlugin } from "../types";

/**
 * Footnotes plugin (FUTURE).
 *
 * Registers `fn`/`f` handlers so footnote markers (`<fn id="1">`) become
 * `footnote-marker` nodes when footnote markup is added to the dataset.
 */
export const footnotesPlugin: VerseParserPlugin = {
  name: "footnotes",
  register(registry) {
    registry.register("fn", ({ attrs }: TagContext) => [
      { type: "footnote-marker", id: attrs.id ?? "" },
    ]);
    registry.register("f", ({ attrs }: TagContext) => [
      { type: "footnote-marker", id: attrs.id ?? "" },
    ]);
  },
};
