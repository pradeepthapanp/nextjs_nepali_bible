"use client";

import type { SearchHighlightNode } from "@features/bible/parsers";
import { cn } from "@/utils/cn";
import { renderInlineChildren, useVerseRender } from "../context";

export interface VerseSearchHighlightProps {
  /** The parsed `search-highlight` node (produced by the search plugin). */
  node: SearchHighlightNode;
  className?: string;
}

/**
 * VerseSearchHighlight — renders a search-match highlight inside a verse.
 *
 * Consumes the `search-highlight` nodes produced by the engine's
 * `searchHighlightPlugin`. Renders children inside a `<mark>` with the app's
 * search colour — the future search results view uses this automatically via
 * the renderer registry (no code change needed).
 */
export function VerseSearchHighlight({
  node,
  className,
}: VerseSearchHighlightProps) {
  const { renderInline } = useVerseRender();
  return (
    <mark
      data-segment="search-highlight"
      className={cn(
        "rounded-sm bg-amber-200/80 px-0.5 text-inherit dark:bg-amber-500/30",
        className,
      )}
    >
      {renderInlineChildren(node.children, renderInline)}
    </mark>
  );
}
