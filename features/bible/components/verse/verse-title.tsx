"use client";

import type { TitleBlockNode, TitleNode } from "@features/bible/parsers";
import { cn } from "@/utils/cn";
import { renderInlineChildren, useVerseRender } from "../context";

export interface VerseTitleProps {
  /** A parsed inline `<t>` title, or a block-level title node. */
  node: TitleNode | TitleBlockNode;
  className?: string;
}

/**
 * VerseTitle — renders a section title.
 *
 * Replaces Flutter's `TitleParser` output (a `Column` of styled `Html` titles)
 * for the `<t>` tag. Inline titles render as a styled span; block titles as a
 * heading. Children are routed through the active renderer registry.
 */
export function VerseTitle({ node, className }: VerseTitleProps) {
  const { renderInline } = useVerseRender();
  const children = renderInlineChildren(node.children, renderInline);

  if (node.type === "title") {
    return (
      <span
        data-segment="title"
        className={cn("font-semibold text-primary", className)}
      >
        {children}
      </span>
    );
  }

  return (
    <h3 data-block="title" className={cn("text-base font-semibold text-primary", className)}>
      {children}
    </h3>
  );
}
