import type { Token } from "./core/tokenizer";
import { tokenizeHtml } from "./core/tokenizer";
import { createDefaultRegistry, type TagRegistry } from "./core/tag-registry";
import type {
  BlockNode,
  InlineNode,
  VerseParseOptions,
  VerseParserPlugin,
} from "./types";

/**
 * Verse Rendering Engine — the shared pipeline.
 *
 *   HTML text → tokens (tokenizer) → InlineNode[] (tag registry + plugins)
 *            → BlockNode[] (buildBlocks)
 *
 * Rendering stays fully separated from React: this module only produces the
 * structured tree. `VerseRenderTree`-consuming React components are added
 * later through the renderer interfaces (`parsers/renderer/types.ts`).
 */

/** Recursively parses a token sequence into inline nodes. */
function parseSequence(
  tokens: Token[],
  start: number,
  registry: TagRegistry,
  options: VerseParseOptions,
): { nodes: InlineNode[]; next: number } {
  const nodes: InlineNode[] = [];
  let index = start;

  while (index < tokens.length) {
    const token = tokens[index];

    if (token.type === "text") {
      nodes.push({ type: "text", text: token.text });
      index += 1;
      continue;
    }

    if (token.type === "tag-close") {
      // Return to the parent tag's handler.
      return { nodes, next: index + 1 };
    }

    if (token.type === "tag-void") {
      nodes.push(
        ...registry.build(token.name, {
          attrs: token.attrs,
          children: [],
          options,
        }),
      );
      index += 1;
      continue;
    }

    // tag-open: parse children up to the matching close, then build.
    const { nodes: children, next } = parseSequence(
      tokens,
      index + 1,
      registry,
      options,
    );
    nodes.push(
      ...registry.build(token.name, {
        attrs: token.attrs,
        children,
        options,
      }),
    );
    index = next;
  }

  return { nodes, next: index };
}

/** Runs each plugin's `register` so custom tags are added to the registry. */
export function registerPlugins(
  registry: TagRegistry,
  plugins: VerseParserPlugin[],
): void {
  for (const plugin of plugins) {
    plugin.register?.(registry);
  }
}

/** Runs each plugin's `transform` in order over the inline node list. */
export function applyPluginTransforms(
  nodes: InlineNode[],
  plugins: VerseParserPlugin[],
  options: VerseParseOptions,
): InlineNode[] {
  let result = nodes;
  for (const plugin of plugins) {
    if (plugin.transform) result = plugin.transform(result, options);
  }
  return result;
}

/** Parses rich HTML text into a flat inline-node list (incl. plugins). */
export function parseRichText(
  text: string,
  options: VerseParseOptions = {},
): InlineNode[] {
  const registry = createDefaultRegistry();
  registerPlugins(registry, options.plugins ?? []);
  const tokens = tokenizeHtml(text);
  const { nodes } = parseSequence(tokens, 0, registry, options);
  return applyPluginTransforms(nodes, options.plugins ?? [], options);
}

/**
 * Groups inline nodes into block nodes, splitting on paragraph breaks
 * (`<pb>`). Poetry grouping is a future plugin concern (a plugin may emit
 * `poetry` blocks before this runs).
 */
export function buildBlocks(nodes: InlineNode[]): BlockNode[] {
  const blocks: BlockNode[] = [];
  let current: InlineNode[] = [];

  const flush = () => {
    if (current.length > 0) {
      blocks.push({ type: "paragraph", children: current });
      current = [];
    }
  };

  for (const node of nodes) {
    if (node.type === "paragraph-break") {
      flush();
      continue;
    }
    current.push(node);
  }
  flush();

  return blocks;
}

/** Convenience: rich text → block nodes. */
export function parseVerseText(
  text: string,
  options: VerseParseOptions = {},
): BlockNode[] {
  return buildBlocks(parseRichText(text, options));
}
