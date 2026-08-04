import type { TagContext, VerseParserPlugin } from "../types";
import { flattenText } from "../core/nodes";

/**
 * Cross-reference markers plugin.
 *
 * The single owner of the `<x>` tag → `cross-reference-marker` node mapping
 * (the default registry deliberately leaves `x` unhandled so there is one
 * place to extend it). A future resolver can attach a resolved
 * `CrossReference` to the marker without changing this handler's shape.
 */
export const crossReferenceMarkersPlugin: VerseParserPlugin = {
  name: "cross-reference-markers",
  register(registry) {
    registry.register("x", ({ children }: TagContext) => {
      const label = flattenText(children);
      return [{ type: "cross-reference-marker", label, children }];
    });
  },
};
