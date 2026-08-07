"use client";

import { cn } from "@/utils/cn";

export interface ChordBadgeProps {
  chord: string;
  /** Optional prefix label (e.g. "Key: " or "Beat: "). */
  prefix?: string;
  className?: string;
}

/**
 * ChordBadge — a standalone chord pill (the web equivalent of Flutter's
 * `Chip(label: 'Key: $mainChord')` in `custom_chords_widget.dart`). Pure
 * display; receives the chord name via props.
 */
export function ChordBadge({ chord, prefix, className }: ChordBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary",
        className,
      )}
    >
      {prefix}
      {chord}
    </span>
  );
}
