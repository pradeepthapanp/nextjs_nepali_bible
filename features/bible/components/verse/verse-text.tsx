"use client";

import type { TextNode } from "@features/bible/parsers";
import { cn } from "@/utils/cn";

export interface VerseTextProps {
  /** The parsed `text` node from the rendering engine. */
  node: TextNode;
  className?: string;
}

/**
 * VerseText — renders a plain-text run.
 *
 * Replaces the base text rendering inside Flutter's `NepParse` / `EngParse`
 * (which fed raw text through flutter_html). It receives an already-parsed
 * `TextNode` and never parses text itself.
 */
export function VerseText({ node, className }: VerseTextProps) {
  return (
    <span data-segment="text" className={cn(className)}>
      {node.text}
    </span>
  );
}
