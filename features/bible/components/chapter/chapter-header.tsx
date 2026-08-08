"use client";

import { toNepaliDigits } from "@features/bible/utils";
import { cn } from "@/utils/cn";

export interface ChapterHeaderProps {
  bookName: string;
  chapterNumber: number;
  /** Optional pre-formatted chapter label (Nepali digits); falls back to formatting. */
  chapterLabel?: string;
  className?: string;
}

/**
 * ChapterHeader — the chapter heading (book name + chapter number).
 *
 * The tappable book/chapter selector lives in the sticky reader toolbar
 * (`ReaderToolbar` → `BookChapterSelectorButton`) so it never scrolls away;
 * this header is just a plain reading title.
 */
export function ChapterHeader({
  bookName,
  chapterNumber,
  chapterLabel,
  className,
}: ChapterHeaderProps) {
  const label = chapterLabel ?? toNepaliDigits(chapterNumber);

  return (
    <h2 className={cn("text-xl font-semibold leading-tight", className)}>
      {bookName} {label}
    </h2>
  );
}
