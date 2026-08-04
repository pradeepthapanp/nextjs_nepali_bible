"use client";

import { cn } from "@/utils/cn";

export interface BookBadgeProps {
  bookName: string;
  /** Opens the book picker when provided. */
  onOpen?: () => void;
  className?: string;
}

/**
 * BookBadge — a chip showing the current book name.
 *
 * Replaces the book chip in Flutter's `bible_home.dart` app bar (a rounded
 * `GestureDetector` with the book's long name). Renders as a button when
 * `onOpen` is provided so it is keyboard accessible; otherwise a static chip.
 */
export function BookBadge({ bookName, onOpen, className }: BookBadgeProps) {
  const classes = cn(
    "inline-flex items-center rounded-full bg-primary/10 px-3.5 py-1.5 text-sm font-medium text-primary",
    className,
  );

  if (onOpen) {
    return (
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open book picker (${bookName})`}
        className={cn(
          classes,
          "transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        {bookName}
      </button>
    );
  }

  return <span className={classes}>{bookName}</span>;
}
