"use client";

import { cn } from "@/utils/cn";

export interface ChordBadgeProps {
  chord: string;
  /** Optional prefix label (e.g. "Key: " or "Beat: "). */
  prefix?: string;
  /** When provided the badge becomes a real button (opens the chord dialog). */
  onClick?: () => void;
  className?: string;
}

/**
 * ChordBadge — a standalone chord pill (the web equivalent of Flutter's
 * `Chip(label: 'Key: $mainChord')` in `custom_chords_widget.dart`). Renders a
 * real button when `onClick` is provided so the "Key" chip is tappable like
 * the inline chords (the "Beat" chip stays plain — it is not a chord).
 */
export function ChordBadge({ chord, prefix, onClick, className }: ChordBadgeProps) {
  const classes = cn(
    "inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary",
    onClick ? "cursor-pointer transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" : undefined,
    className,
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`Show chord ${chord}`}
        className={classes}
      >
        {prefix}
        {chord}
      </button>
    );
  }

  return (
    <span className={classes}>
      {prefix}
      {chord}
    </span>
  );
}
