"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { SearchHistoryEntry } from "../types";

/**
 * Search history — recently run queries, persisted to localStorage (SSR-safe
 * via Zustand's persist middleware). "Recent searches" in the UI are these
 * entries, most-recent first, capped at `SEARCH_HISTORY_LIMIT`.
 */

const STORAGE_KEY = "bible.search-history";
export const SEARCH_HISTORY_LIMIT = 8;

interface SearchHistoryState {
  entries: SearchHistoryEntry[];
  /** Records a committed query, deduplicated and moved to the front. */
  push: (query: string) => void;
  remove: (query: string) => void;
  clear: () => void;
}

export const useSearchHistoryStore = create<SearchHistoryState>()(
  persist(
    (set, get) => ({
      entries: [],
      push: (query) => {
        const trimmed = query.trim();
        if (!trimmed) return;
        set({
          entries: [
            { query: trimmed, timestamp: Date.now() },
            ...get().entries.filter((entry) => entry.query !== trimmed),
          ].slice(0, SEARCH_HISTORY_LIMIT),
        });
      },
      remove: (query) =>
        set({
          entries: get().entries.filter((entry) => entry.query !== query),
        }),
      clear: () => set({ entries: [] }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
