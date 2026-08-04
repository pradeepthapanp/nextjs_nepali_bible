"use client";

import type { ParagraphNode } from "@features/bible/parsers";
import { cn } from "@/utils/cn";
import { renderInlineChildren, useVerseRender } from "../context";

export interface VerseParagraphProps {
  /** The parsed `paragraph` block from the rendering engine. */
  block: ParagraphNode;
  className?: string;
}

/**
 * VerseParagraph — renders a paragraph block, laying out its inline segments.
 *
 * Replaces the block flow of Flutter's `NepParse`/`EngParse` (which wrapped
 * each verse in an inline `Html` widget). Renders as a semantic `<p>` and
 * routes each child through the active renderer registry.
 */
export function VerseParagraph({ block, className }: VerseParagraphProps) {
  const { renderInline } = useVerseRender();
  return (
    <p data-block="paragraph" className={cn("text-pretty", className)}>
      {renderInlineChildren(block.children, renderInline)}
    </p>
  );
}
