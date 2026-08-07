"use client";

import type { ChordSegment } from "@features/music/types";
import { cn } from "@/utils/cn";
import { ChordText } from "./chord-text";

export interface ChordLineProps {
  /** Already-parsed chord segments (`parseChordLine` output). */
  segments: ChordSegment[];
  onChordTap?: (chord: string) => void;
  className?: string;
}

/**
 * ChordLine — renders raw, already-parsed chord segments (`ChordSegment[]`
 * from `parseChordLine`) as a wrapped row. Each chord segment renders via
 * `ChordText` (chord above lyric); plain segments render as text. Used by
 * preview/copy surfaces that have segments but not a full render tree. Never
 * transposes or parses — the segments are already parsed.
 */
export function ChordLine({ segments, onChordTap, className }: ChordLineProps) {
  return (
    <div className={cn("flex flex-wrap items-end gap-x-1", className)}>
      {segments.map((segment, index) =>
        segment.chord ? (
          <ChordText
            key={index}
            chord={segment.chord}
            lyric={segment.lyric}
            onChordTap={onChordTap}
          />
        ) : (
          <span key={index}>{segment.lyric}</span>
        ),
      )}
    </div>
  );
}
