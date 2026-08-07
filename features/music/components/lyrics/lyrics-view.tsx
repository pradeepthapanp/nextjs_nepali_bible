"use client";

import type { LyricsRenderTree } from "@features/music/parsers";
import { cn } from "@/utils/cn";
import { LyricsLine } from "./lyrics-line";

export interface LyricsViewProps {
  /** An already-parsed lyrics render tree (never parsed here). */
  tree: LyricsRenderTree;
  className?: string;
}

/**
 * LyricsView — the lyric body of the render tree: each stanza (block) renders
 * its `LyricsLine`s with block spacing (the web equivalent of the line flow
 * in `custom_chords_widget.dart`). Consumes an already-parsed
 * `LyricsRenderTree`; inline nodes render through `LyricsLine` → the render
 * registry. No parsing, no transposing.
 */
export function LyricsView({ tree, className }: LyricsViewProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {tree.blocks.map((block, blockIndex) => (
        <div key={blockIndex} className="space-y-1">
          {block.lines.map((line, lineIndex) => (
            <LyricsLine key={lineIndex} line={line} />
          ))}
        </div>
      ))}
    </div>
  );
}
