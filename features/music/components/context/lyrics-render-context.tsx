"use client";

import {
  Fragment,
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { LyricsInlineNode } from "@features/music/parsers";
import type { LyricsRendererRegistry } from "../registry/lyrics-registry";

/**
 * Lyrics rendering context.
 *
 * Bridges the lyrics engine's render tree to React: lyric components consume
 * `useLyricsRender()` to render inline nodes through the active registry.
 * This keeps every component presentational (it receives parsed nodes and
 * renders them) while staying composable — the same pattern as the Bible
 * module's `VerseRenderProvider`.
 */

export interface LyricsRenderValue {
  renderInline(node: LyricsInlineNode): ReactNode;
}

/** Renders a list of inline nodes through a renderInline function. */
export function renderInlineChildren(
  nodes: LyricsInlineNode[],
  renderInline: (node: LyricsInlineNode) => ReactNode,
): ReactNode {
  return nodes.map((node, index) => (
    <Fragment key={index}>{renderInline(node)}</Fragment>
  ));
}

const LyricsRenderContext = createContext<LyricsRenderValue | null>(null);

/**
 * Provides a custom lyric renderer registry to a subtree (e.g. `SongReader`
 * wraps itself with `createLyricsRendererRegistry({ showChords, onChordTap })`).
 */
export function LyricsRenderProvider({
  registry,
  children,
}: {
  registry: LyricsRendererRegistry;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({ renderInline: registry.renderInline }),
    [registry],
  );
  return (
    <LyricsRenderContext.Provider value={value}>
      {children}
    </LyricsRenderContext.Provider>
  );
}

// Default registry used when a component is used standalone (outside a
// provider). Set once by `components/registry/index.ts` at module load.
let defaultValue: LyricsRenderValue | null = null;

export function setDefaultLyricsRenderer(
  registry: LyricsRendererRegistry | null,
): void {
  defaultValue = registry ? { renderInline: registry.renderInline } : null;
}

/**
 * Returns the inline-node render function. Uses the nearest provider, or the
 * default registry when used standalone.
 */
export function useLyricsRender(): LyricsRenderValue {
  const context = useContext(LyricsRenderContext);
  if (context) return context;
  if (!defaultValue) {
    throw new Error(
      "[music] Lyrics renderer registry is not initialised — wrap the tree in <LyricsRenderProvider> or import '@features/music/components'.",
    );
  }
  return defaultValue;
}
