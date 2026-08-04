"use client";

import { useCallback, useMemo } from "react";
import { useBooks } from "../queries";
import { useReadingStore } from "../store";
import { nextChapter, prevChapter } from "../utils";

/**
 * Infinite chapter navigation — next/prev chapter that wraps across book
 * boundaries (using the canonical chapter counts from `useBooks`). Composes
 * `useReadingPosition`'s store with pure `reference-math` utilities.
 */
export function useChapterNavigation() {
  const { bookNumber, chapter, setChapter } = useReadingStore();
  const { data: books } = useBooks();

  const current = useMemo(
    () => ({ bookNumber, chapter }),
    [bookNumber, chapter],
  );

  const goNext = useCallback(() => {
    if (!books) return;
    const target = nextChapter(current, books);
    if (target) setChapter(target.bookNumber, target.chapter);
  }, [books, current, setChapter]);

  const goPrev = useCallback(() => {
    if (!books) return;
    const target = prevChapter(current, books);
    if (target) setChapter(target.bookNumber, target.chapter);
  }, [books, current, setChapter]);

  const canGoNext = Boolean(books && nextChapter(current, books));
  const canGoPrev = Boolean(books && prevChapter(current, books));

  return { current, goNext, goPrev, canGoNext, canGoPrev };
}
