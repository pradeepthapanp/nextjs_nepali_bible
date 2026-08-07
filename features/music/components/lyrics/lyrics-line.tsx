"use client";

import type { LyricsLineNode } from "@features/music/parsers";
import { cn } from "@/utils/cn";
import { renderInlineChildren, useLyricsRender } from "../context/lyrics-render-context";

export interface LyricsLineProps {
  /** An already-parsed line from the lyrics render tree. */
  line: LyricsLineNode;
  className?: string;
}

/**
 * LyricsLine — one parsed line of the render tree (the web equivalent of the
 * `lines` mapping in `custom_chords_widget.dart`). Renders the line's inline
 * nodes through `useLyricsRender()` (the active registry), so chord
 * visibility and chord-tap behavior are decided by the registry — the
 * component never parses or transposes.
 */
export function LyricsLine({ line, className }: LyricsLineProps) {
  const { renderInline } = useLyricsRender();
  return (
    <div className={cn("flex flex-wrap items-end gap-x-1", className)}>
      {renderInlineChildren(line.nodes, renderInline)}
    </div>
  );
}
