"use client";

import type { LyricsRenderTree } from "@features/music/parsers";
import { cn } from "@/utils/cn";
import { ChordBadge } from "../lyrics/chord-badge";

export interface SongHeaderProps {
  /** The render tree whose header facts (title, key, beat) are displayed. */
  tree: LyricsRenderTree;
  /** Opens the chord dialog for the "Key" chip (the main chord). */
  onChordTap?: (chord: string) => void;
  className?: string;
}

/**
 * SongHeader — the song header of the reader (the web equivalent of the
 * title + "Key"/"Beat" chips in `custom_chords_widget.dart`). Presentational:
 * reads only the tree's header facts and composes `ChordBadge`. The "Key"
 * chip is a tappable chord (opens the chord dialog); the "Beat" chip stays
 * plain because it is a time signature, not a chord.
 */
export function SongHeader({ tree, onChordTap, className }: SongHeaderProps) {
  return (
    <header className={cn("space-y-2", className)}>
      <h2 className="text-xl font-bold text-foreground">{tree.title}</h2>
      {tree.mainChord || tree.beat ? (
        <div className="flex flex-wrap gap-2">
          {tree.mainChord ? (
            <ChordBadge
              chord={tree.mainChord}
              prefix="Key: "
              onClick={onChordTap ? () => onChordTap(tree.mainChord as string) : undefined}
            />
          ) : null}
          {tree.beat ? <ChordBadge chord={tree.beat} prefix="Beat: " /> : null}
        </div>
      ) : null}
    </header>
  );
}
