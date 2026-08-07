"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Recent selections — recently opened books and recently used Bible versions.
 *
 * A web addition to the Flutter app (which only persisted the single current
 * `bookPosition`/`bible` in `Setting`): the BibleSelectionDialog shows these
 * for quick re-opening. Client-only UI state, persisted to localStorage via
 * Zustand's persist middleware (SSR-safe: `localStorage` is read lazily on the
 * client only).
 */

const STORAGE_KEY = "bible.recents";

/** Max number of recently opened books kept. */
export const RECENT_BOOKS_LIMIT = 8;
/** Max number of recently used Bible versions kept. */
export const RECENT_VERSIONS_LIMIT = 4;

interface RecentState {
  /** Book numbers, most-recent first. */
  recentBooks: number[];
  /** Version ids, most-recent first. */
  recentVersions: string[];
  /** Records an opened book, moving it to the front (deduplicated, capped). */
  pushBook: (bookNumber: number) => void;
  /** Records a used version, moving it to the front (deduplicated, capped). */
  pushVersion: (versionId: string) => void;
  clear: () => void;
}

export const useRecentStore = create<RecentState>()(
  persist(
    (set, get) => ({
      recentBooks: [],
      recentVersions: [],
      pushBook: (bookNumber) =>
        set({
          recentBooks: [
            bookNumber,
            ...get().recentBooks.filter((book) => book !== bookNumber),
          ].slice(0, RECENT_BOOKS_LIMIT),
        }),
      pushVersion: (versionId) =>
        set({
          recentVersions: [
            versionId,
            ...get().recentVersions.filter((id) => id !== versionId),
          ].slice(0, RECENT_VERSIONS_LIMIT),
        }),
      clear: () => set({ recentBooks: [], recentVersions: [] }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
