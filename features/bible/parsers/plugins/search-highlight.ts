import { mapInlineChildren } from "../core/nodes";
import type { InlineNode, VerseParserPlugin } from "../types";

/**
 * Search-result highlighting plugin.
 *
 * Wraps every case-insensitive match of `options.searchQuery` in `search-
 * highlight` nodes, recursively. This is what the future search results view
 * uses to emphasise matches inside parsed verses. Pure and unit-testable.
 */

export function highlightMatches(
  nodes: InlineNode[],
  query: string,
): InlineNode[] {
  const normalized = query.trim();
  if (!normalized) return nodes;

  const lowerQuery = normalized.toLowerCase();
  const result: InlineNode[] = [];

  for (const node of nodes) {
    if (node.type !== "text") {
      if ("children" in node) {
        result.push(
          ...mapInlineChildren([node], (children) =>
            highlightMatches(children, normalized),
          ),
        );
      } else {
        result.push(node);
      }
      continue;
    }

    const text = node.text;
    const lowerText = text.toLowerCase();
    let cursor = 0;

    while (cursor < text.length) {
      const matchIndex = lowerText.indexOf(lowerQuery, cursor);
      if (matchIndex === -1) {
        if (cursor < text.length) {
          result.push({ type: "text", text: text.slice(cursor) });
        }
        break;
      }
      if (matchIndex > cursor) {
        result.push({ type: "text", text: text.slice(cursor, matchIndex) });
      }
      const matched = text.slice(matchIndex, matchIndex + normalized.length);
      result.push({
        type: "search-highlight",
        children: [{ type: "text", text: matched }],
      });
      cursor = matchIndex + normalized.length;
    }
  }

  return result;
}

export const searchHighlightPlugin: VerseParserPlugin = {
  name: "search-highlight",
  transform: (nodes, options) =>
    highlightMatches(nodes, options.searchQuery ?? ""),
};
