"use client";

import { create } from "zustand";
import { DEFAULT_BIBLE_VERSION } from "../constants";
import { DEFAULT_BOOK_NUMBER, DEFAULT_CHAPTER_NUMBER } from "../constants";

/**
 * Reader UI state: which version/book/chapter/verse is on screen. This is
 * *client navigation state* — the source of truth for the reading view — while
 * persistence (reading progress) lives in `progress-service`/`useReadingProgress`.
 *
 * Mirrors the Flutter `Setting.bookPosition` / `chapterPosition` and the
 * current-version selection.
 */
interface ReadingState {
  versionId: string;
  bookNumber: number;
  chapter: number;
  /** Optional focused verse (e.g. from a deep link). */
  verse?: number;
  setVersion: (versionId: string) => void;
  setChapter: (bookNumber: number, chapter: number, verse?: number) => void;
  reset: () => void;
}

export const useReadingStore = create<ReadingState>()((set) => ({
  versionId: DEFAULT_BIBLE_VERSION.id,
  bookNumber: DEFAULT_BOOK_NUMBER,
  chapter: DEFAULT_CHAPTER_NUMBER,
  verse: undefined,
  setVersion: (versionId) => set({ versionId }),
  setChapter: (bookNumber, chapter, verse) =>
    set({ bookNumber, chapter, verse }),
  reset: () =>
    set({
      bookNumber: DEFAULT_BOOK_NUMBER,
      chapter: DEFAULT_CHAPTER_NUMBER,
      verse: undefined,
    }),
}));
