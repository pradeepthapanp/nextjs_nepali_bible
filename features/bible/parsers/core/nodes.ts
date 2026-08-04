import type { InlineNode } from "../types";

/**
 * Shared helpers over the inline-node model. Pure and unit-testable; used by
 * the engine, tag handlers and plugins.
 */

export type ParentInlineNode = Extract<InlineNode, { children: InlineNode[] }>;

export function isParentNode(node: InlineNode): node is ParentInlineNode {
  return "children" in node;
}

/** Concatenates all text within a node list (recursively). */
export function flattenText(nodes: InlineNode[]): string {
  let out = "";
  for (const node of nodes) {
    switch (node.type) {
      case "text":
      case "verse-number":
      case "note":
        out += node.text;
        break;
      case "strongs":
        out += node.number;
        break;
      case "paragraph-break":
        out += "\n\n";
        break;
      case "line-break":
        out += "\n";
        break;
      case "footnote-marker":
        break;
      default:
        if (isParentNode(node)) out += flattenText(node.children);
    }
  }
  return out;
}

/**
 * Applies `fn` to every node list, preserving the tree shape. Parent nodes
 * keep their type and attributes; only `children` is replaced. Used by
 * post-processing plugins (search highlight, inline highlight, notes).
 */
export function mapInlineChildren(
  nodes: InlineNode[],
  fn: (children: InlineNode[]) => InlineNode[],
): InlineNode[] {
  return nodes.map((node) => {
    if (!isParentNode(node)) return node;
    return { ...node, children: fn(node.children) };
  });
}
