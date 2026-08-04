import type {
  BlockNode,
  CommentaryRenderTree,
  InlineNode,
  TitleRenderTree,
  VerseRenderTree,
} from "../types";

/**
 * Renderer interfaces — UI-agnostic. The Verse Rendering Engine only produces
 * the structured tree; rendering to any target (React nodes, plain text, JSON)
 * is done through these interfaces, so the parsing logic never depends on a
 * framework.
 *
 * The future React `VerseView` (in `features/bible/components/`) will
 * instantiate `createRendererRegistry<ReactNode>()`, register a renderer per
 * node type, and call `VerseRenderer.render(tree)`.
 */

export interface InlineRenderer<TElement> {
  /** Whether this renderer handles the given inline node. */
  match(node: InlineNode): boolean;
  render(node: InlineNode): TElement;
}

export interface BlockRenderer<TElement> {
  match(node: BlockNode): boolean;
  render(node: BlockNode): TElement;
}

/** Routes nodes to the first matching renderer (with a text fallback). */
export interface RendererRegistry<TElement> {
  registerInline(renderer: InlineRenderer<TElement>): void;
  registerBlock(renderer: BlockRenderer<TElement>): void;
  renderInline(node: InlineNode): TElement;
  renderBlock(node: BlockNode): TElement;
}

export interface VerseRenderer<TElement> {
  render(tree: VerseRenderTree): TElement;
}

export interface CommentaryRenderer<TElement> {
  render(tree: CommentaryRenderTree): TElement;
}

export interface TitleRenderer<TElement> {
  render(tree: TitleRenderTree): TElement;
}

/** Builds a renderer registry with a plain-text fallback for unmatched nodes. */
export function createRendererRegistry<TElement>(
  fallbackText: (text: string) => TElement,
): RendererRegistry<TElement> {
  const inlineRenderers: InlineRenderer<TElement>[] = [];
  const blockRenderers: BlockRenderer<TElement>[] = [];

  return {
    registerInline(renderer) {
      inlineRenderers.push(renderer);
    },
    registerBlock(renderer) {
      blockRenderers.push(renderer);
    },
    renderInline(node) {
      for (const renderer of inlineRenderers) {
        if (renderer.match(node)) return renderer.render(node);
      }
      return fallbackText(node.type === "text" ? node.text : "");
    },
    renderBlock(node) {
      for (const renderer of blockRenderers) {
        if (renderer.match(node)) return renderer.render(node);
      }
      return fallbackText("");
    },
  };
}
