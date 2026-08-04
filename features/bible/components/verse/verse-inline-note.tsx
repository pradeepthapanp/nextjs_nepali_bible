"use client";

import type { InlineNoteNode, NoteNode } from "@features/bible/parsers";
import { cn } from "@/utils/cn";
import { renderInlineChildren, useVerseRender } from "../context";

export interface VerseInlineNoteProps {
  /** A parsed `inline-note` (rich) or `note` (simple `<n>`) node. */
  node: InlineNoteNode | NoteNode;
  className?: string;
}

/**
 * VerseInlineNote — renders an inline note annotation.
 *
 * Replaces the `<n>` handling in Flutter's `NepParse`/`EngParse` (styled with
 * the disabled colour). The simple `note` node renders its text dimmed; the
 * richer `inline-note` node (future) renders its children so a note popover
 * can be attached later without changing this component.
 */
export function VerseInlineNote({ node, className }: VerseInlineNoteProps) {
  const { renderInline } = useVerseRender();

  if (node.type === "note") {
    return (
      <span
        data-segment="note"
        className={cn("text-muted-foreground", className)}
      >
        {node.text}
      </span>
    );
  }

  return (
    <span
      data-segment="inline-note"
      className={cn("text-muted-foreground", className)}
    >
      {renderInlineChildren(node.children, renderInline)}
    </span>
  );
}
