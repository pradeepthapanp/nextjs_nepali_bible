"use client";

import type { InlineHighlightNode } from "@features/bible/parsers";
import { HIGHLIGHT_COLORS } from "@features/bible/constants";
import { cn } from "@/utils/cn";
import { renderInlineChildren, useVerseRender } from "../context";

export interface VerseHighlightProps {
  /** The parsed `inline-highlight` node. */
  node: InlineHighlightNode;
  className?: string;
}

/**
 * VerseHighlight — renders an inline highlight run within a verse.
 *
 * Web-first (Flutter highlighted whole verses via a container background).
 * Renders children inside a `<mark>` coloured by the shared highlight palette
 * (`HIGHLIGHT_COLORS`), so the colour mapping stays in one place.
 */
export function VerseHighlight({ node, className }: VerseHighlightProps) {
  const { renderInline } = useVerseRender();
  const palette = HIGHLIGHT_COLORS[node.color];
  return (
    <mark
      data-segment="inline-highlight"
      className={cn("rounded-sm px-0.5 text-inherit", palette.className, className)}
    >
      {renderInlineChildren(node.children, renderInline)}
    </mark>
  );
}
