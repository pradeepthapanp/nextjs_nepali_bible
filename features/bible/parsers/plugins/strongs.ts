import type { TagContext, VerseParserPlugin } from "../types";
import { flattenText } from "../core/nodes";

/**
 * Strong's numbers plugin (FUTURE).
 *
 * The dataset does not currently carry Strong's markup, so the tag handler is
 * registered ahead of time and documented. When Strong's numbers arrive as
 * `<w>H7225</w>` (or `<s>`), this plugin turns them into `strongs` nodes —
 * added here without touching any existing handler.
 */
export const strongsPlugin: VerseParserPlugin = {
  name: "strongs",
  register(registry) {
    registry.register("w", ({ children }: TagContext) => [
      { type: "strongs", number: flattenText(children), children },
    ]);
    registry.register("s", ({ children }: TagContext) => [
      { type: "strongs", number: flattenText(children), children },
    ]);
  },
};
