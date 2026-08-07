"use client";

import { create } from "zustand";
import type { SearchMatchMode, SearchVersionScope } from "../search/types";
import type { SearchPriority, SearchTestament } from "../types";

/**
 * Search UI state — the raw query plus filters (testament, language,
 * priority, match mode, version scope, optional book filter). Mirrors the
 * Flutter search providers (`verse_search_query_provider`,
 * `search_testament_provider`, `search_priority_provider`, ...). The debounced
 * query is fed to the search query hooks by the search feature hook.
 */
interface SearchState {
  query: string;
  testament: SearchTestament;
  language: "ne" | "en";
  priority: SearchPriority;
  /** Partial / exact-phrase / whole-word matching. */
  matchMode: SearchMatchMode;
  /** Current version or all versions. */
  versionScope: SearchVersionScope;
  /** Restrict to one book (from a deep link / filter chip). */
  bookNumber?: number;
  setQuery: (query: string) => void;
  setTestament: (testament: SearchTestament) => void;
  setLanguage: (language: "ne" | "en") => void;
  setPriority: (priority: SearchPriority) => void;
  setMatchMode: (mode: SearchMatchMode) => void;
  setVersionScope: (scope: SearchVersionScope) => void;
  setBookNumber: (bookNumber?: number) => void;
  reset: () => void;
}

export const useSearchStore = create<SearchState>()((set) => ({
  query: "",
  testament: "all",
  language: "ne",
  // English-first matches the Flutter `SearchPriorityNotifier` default and
  // searches BOTH the English table and the primary version table.
  priority: "english",
  matchMode: "partial",
  versionScope: "current",
  bookNumber: undefined,
  setQuery: (query) => set({ query }),
  setTestament: (testament) => set({ testament }),
  setLanguage: (language) => set({ language }),
  setPriority: (priority) => set({ priority }),
  setMatchMode: (matchMode) => set({ matchMode }),
  setVersionScope: (versionScope) => set({ versionScope }),
  setBookNumber: (bookNumber) => set({ bookNumber }),
  reset: () =>
    set({
      query: "",
      testament: "all",
      language: "ne",
      priority: "english",
      matchMode: "partial",
      versionScope: "current",
      bookNumber: undefined,
    }),
}));
