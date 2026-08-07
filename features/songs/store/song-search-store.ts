"use client";

import { create } from "zustand";

/**
 * Audio library filter store — client UI state for the list page (the Flutter
 * `AudiosListPage` has no such store because it had no search/filters; this is
 * the web refinement's home). Search + category are applied CLIENT-SIDE to the
 * fetched pages. NOT persisted — a refresh restarts the filter.
 */
export interface SongSearchStore {
  query: string;
  /** The selected category, or `"all"` for every audio. */
  category: string;
  setQuery: (query: string) => void;
  setCategory: (category: string) => void;
  clear: () => void;
}

export const useSongSearchStore = create<SongSearchStore>()((set) => ({
  query: "",
  category: "all",
  setQuery: (query) => set({ query }),
  setCategory: (category) => set({ category }),
  clear: () => set({ query: "", category: "all" }),
}));
