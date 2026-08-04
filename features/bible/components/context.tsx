"use client";

import {
  Fragment,
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { BlockNode, InlineNode, RendererRegistry } from "@features/bible/parsers";

/**
 * Verse rendering context.
 *
 * Bridges the UI-agnostic engine (`parsers/renderer`) to React: components
 * consume `useVerseRender()` to render child inline/block nodes through the
 * active `RendererRegistry`. This keeps every component presentational (it
 * receives parsed nodes and renders them) while staying composable.
 */

export interface VerseRenderValue {
  renderInline(node: InlineNode): ReactNode;
  renderBlock(node: BlockNode): ReactNode;
}

const VerseRenderContext = createContext<VerseRenderValue | null>(null);

/** Renders a list of inline nodes through a renderInline function. */
export function renderInlineChildren(
  children: InlineNode[],
  renderInline: (node: InlineNode) => ReactNode,
): ReactNode {
  return children.map((child, index) => (
    <Fragment key={index}>{renderInline(child)}</Fragment>
  ));
}

function toValue(registry: RendererRegistry<ReactNode>): VerseRenderValue {
  return {
    renderInline: (node) => registry.renderInline(node),
    renderBlock: (node) => registry.renderBlock(node),
  };
}

/**
 * Provides a custom renderer registry to a subtree (the future ChapterViewer
 * will wrap the chapter in this with `createVerseRendererRegistry()`).
 */
export function VerseRenderProvider({
  registry,
  children,
}: {
  registry: RendererRegistry<ReactNode>;
  children: ReactNode;
}) {
  const value = useMemo(() => toValue(registry), [registry]);
  return (
    <VerseRenderContext.Provider value={value}>
      {children}
    </VerseRenderContext.Provider>
  );
}

// Default registry used when a component is used standalone (outside a
// provider). Set once by `components/registry.tsx` at module load.
let defaultValue: VerseRenderValue | null = null;

export function setDefaultVerseRenderer(
  registry: RendererRegistry<ReactNode> | null,
): void {
  defaultValue = registry ? toValue(registry) : null;
}

/**
 * Returns the render functions for inline/block nodes. Uses the nearest
 * provider, or the default verse renderer registry when used standalone.
 */
export function useVerseRender(): VerseRenderValue {
  const context = useContext(VerseRenderContext);
  if (context) return context;
  if (!defaultValue) {
    throw new Error(
      "[bible] Verse renderer registry is not initialised — import '@features/bible/components' or wrap the tree in <VerseRenderProvider>.",
    );
  }
  return defaultValue;
}
