"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

export interface BookChapterSelectorButtonProps {
  bookName: string;
  /** Pre-formatted chapter label (Nepali digits). */
  chapterLabel: string;
  onOpenBook?: () => void;
  onOpenChapter?: () => void;
  className?: string;
}

/**
 * BookChapterSelectorButton — the "book | chapter" pill in the reader header.
 *
 * Replaces the two-chip app-bar title in Flutter's `bible_home.dart` (a
 * rounded pill split into the book name and the chapter, each opening its own
 * picker). Renders two adjacent buttons so both targets are keyboard
 * accessible.
 */
export function BookChapterSelectorButton({
  bookName,
  chapterLabel,
  onOpenBook,
  onOpenChapter,
  className,
}: BookChapterSelectorButtonProps) {
  const base = cn(
    "inline-flex items-center gap-1 px-3.5 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  );

  return (
    <div className={cn("inline-flex items-stretch overflow-hidden rounded-full bg-primary/10", className)}>
      {onOpenBook ? (
        <button
          type="button"
          onClick={onOpenBook}
          aria-label={`Open book picker (${bookName})`}
          className={cn(base, "rounded-l-full")}
        >
          {bookName}
        </button>
      ) : (
        <span className={cn(base, "rounded-l-full")}>{bookName}</span>
      )}

      {onOpenChapter ? (
        <button
          type="button"
          onClick={onOpenChapter}
          aria-label={`Open chapter picker (chapter ${chapterLabel})`}
          className={cn(base, "rounded-r-full border-l border-primary/20")}
        >
          {chapterLabel}
          <ChevronDown className="size-3.5" aria-hidden />
        </button>
      ) : (
        <span className={cn(base, "rounded-r-full border-l border-primary/20")}>
          {chapterLabel}
          <ChevronDown className="size-3.5" aria-hidden />
        </span>
      )}
    </div>
  );
}
