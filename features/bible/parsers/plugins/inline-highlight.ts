import { mapInlineChildren } from "../core/nodes";
import type {
  InlineNode,
  VerseParseOptions,
  VerseParserPlugin,
} from "../types";

/**
 * Inline-highlight plugin (FUTURE).
 *
 * Applies a colour to a run of text within a verse (e.g. a user-selected
 * range), distinct from whole-verse highlighting (which is a container-level
 * background applied by the future ChapterViewer). The exact range API is
 * defined once the selection model is built; the transform below shows the
 * shape (a text query → `inline-highlight` nodes) and is unit-testable.
 */

export function applyInlineHighlight(
  nodes: InlineNode[],
  query: string,
  color: "yellow" | "green" | "blue" | "pink" | "purple",
): InlineNode[] {
  if (!query) return nodes;
  const lowerQuery = query.toLowerCase();
  return nodes.flatMap((node) => {
    if (node.type === "text") {
      const index = node.text.toLowerCase().indexOf(lowerQuery);
      if (index === -1) return [node];
      const before = node.text.slice(0, index);
      const matched = node.text.slice(index, index + query.length);
      const after = node.text.slice(index + query.length);
      return [
        ...(before ? [{ type: "text" as const, text: before }] : []),
        {
          type: "inline-highlight" as const,
          color,
          children: [{ type: "text" as const, text: matched }],
        },
        ...(after ? [{ type: "text" as const, text: after }] : []),
      ];
    }
    return "children" in node
      ? mapInlineChildren([node], (children) =>
          applyInlineHighlight(children, query, color),
        )
      : [node];
  });
}

export const inlineHighlightPlugin: VerseParserPlugin = {
  name: "inline-highlight",
  transform: (nodes: InlineNode[], options: VerseParseOptions) => {
    if (!options.searchQuery) return nodes;
    return applyInlineHighlight(nodes, options.searchQuery, "yellow");
  },
};
