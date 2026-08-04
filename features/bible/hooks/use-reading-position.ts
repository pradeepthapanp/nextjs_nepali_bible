"use client";

import { useCallback } from "react";
import { useReadingProgress, useSaveReadingProgress } from "../queries";
import { useReadingStore } from "../store";

/**
 * Wires the reader navigation state (`reading-store`) to persistence
 * (`progress-service`). The single place that decides "the user opened
 * chapter X" → update the store and persist the reading position.
 */
export function useReadingPosition() {
  const {
    versionId,
    bookNumber,
    chapter,
    verse,
    setChapter,
    setVersion,
  } = useReadingStore();
  const { data: savedPosition } = useReadingProgress();
  const saveProgress = useSaveReadingProgress();

  const openChapter = useCallback(
    (nextBook: number, nextChapter: number, nextVerse?: number) => {
      setChapter(nextBook, nextChapter, nextVerse);
      saveProgress.mutate({
        versionId,
        bookNumber: nextBook,
        chapter: nextChapter,
        verse: nextVerse,
        updatedAt: new Date().toISOString(),
      });
    },
    [versionId, setChapter, saveProgress],
  );

  return {
    versionId,
    bookNumber,
    chapter,
    verse,
    savedPosition,
    openChapter,
    setVersion,
  };
}
