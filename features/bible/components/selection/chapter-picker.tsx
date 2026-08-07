"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { useBooks } from "../../queries";
import { useReadingStore } from "../../store";
import type { Book } from "../../types";
import { toNepaliDigits } from "../../utils";

/**
 * ChapterPicker — a reusable grid for choosing a chapter of a book.
 *
 * Replaces the Flutter `ChapterSelection` widget
 * (`lib/bible/widgets/chapter_selection_widget.dart`): a grid of chapters
 * (1..book.chapters) with the current one highlighted; selecting reports via
 * `onSelect`. Smart default: when `book` is omitted it resolves the book from
 * `useBooks()` + the reading store, and highlights the current chapter.
 */

export interface ChapterPickerProps {
  /** The book whose chapters to show; resolved from hooks when omitted. */
  book?: Book;
  /** Chapter to highlight; defaults to the reading store. */
  value?: number;
  /** Fired when a chapter is chosen. */
  onSelect?: (chapter: number) => void;
  className?: string;
}

export function ChapterPicker({
  book: bookProp,
  value,
  onSelect,
  className,
}: ChapterPickerProps) {
  const { data: books } = useBooks();
  const storeBookNumber = useReadingStore((state) => state.bookNumber);
  const storeChapter = useReadingStore((state) => state.chapter);

  const book =
    bookProp ??
    books?.find((entry) => entry.bookNumber === storeBookNumber);
  const selected = value ?? storeChapter;

  const chapters = useMemo(
    () =>
      book
        ? Array.from({ length: book.chapters }, (_, index) => index + 1)
        : [],
    [book],
  );

  if (!book) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        पुस्तक लोड भइरहेको छ…
      </p>
    );
  }

  return (
    <div className={cn("grid grid-cols-4 gap-2 sm:grid-cols-5", className)}>
      {chapters.map((chapter) => (
        <Button
          key={chapter}
          type="button"
          variant={chapter === selected ? "default" : "outline"}
          onClick={() => onSelect?.(chapter)}
          className="h-auto min-h-11 px-2 text-base"
        >
          {toNepaliDigits(chapter)}
        </Button>
      ))}
    </div>
  );
}
