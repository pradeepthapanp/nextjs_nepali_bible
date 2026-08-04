"use client";

import { toNepaliDigits } from "@features/bible/utils";
import { cn } from "@/utils/cn";
import { BookChapterSelectorButton } from "../reader/book-chapter-selector-button";

export interface ChapterHeaderProps {
  bookName: string;
  chapterNumber: number;
  /** Optional pre-formatted chapter label (Nepali digits); falls back to formatting. */
  chapterLabel?: string;
  onOpenBook?: () => void;
  onOpenChapter?: () => void;
  className?: string;
}

/**
 * ChapterHeader — the chapter heading (book + chapter selector).
 *
 * Replaces the `TopAppBar`/`AppBar` title in Flutter's `bible_home.dart`
 * (book chip + chapter chip). Composes `BookChapterSelectorButton` and stays
 * presentational — navigation is delegated via callbacks.
 */
export function ChapterHeader({
  bookName,
  chapterNumber,
  chapterLabel,
  onOpenBook,
  onOpenChapter,
  className,
}: ChapterHeaderProps) {
  const label = chapterLabel ?? toNepaliDigits(chapterNumber);

  return (
    <div className={cn("flex items-center justify-between gap-2", className)}>
      <BookChapterSelectorButton
        bookName={bookName}
        chapterLabel={label}
        onOpenBook={onOpenBook}
        onOpenChapter={onOpenChapter}
      />
    </div>
  );
}
