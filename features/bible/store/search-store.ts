"use client";

import { create } from "zustand";
import type { SearchPriority, SearchTestament } from "../types";

/**
 * Search UI state — the raw query plus filters (testament, language,
 * priority). Mirrors the Flutter search providers (`verse_search_query_provider`,
 * `search_testament_provider`, `search_priority_provider`, ...). The debounced
 * query is fed to `useSearchVerses` by the `useSearch` hook.
 */
interface SearchState {
  query: string;
  testament: SearchTestament;
  language: "ne" | "en";
  priority: SearchPriority;
  setQuery: (query: string) => void;
  setTestament: (testament: SearchTestament) => void;
  setLanguage: (language: "ne" | "en") => void;
  setPriority: (priority: SearchPriority) => void;
  reset: () => void;
}

export const useSearchStore = create<SearchState>()((set) => ({
  query: "",
  testament: "all",
  language: "ne",
  priority: "nepali",
  setQuery: (query) => set({ query }),
  setTestament: (testament) => set({ testament }),
  setLanguage: (language) => set({ language }),
  setPriority: (priority) => set({ priority }),
  reset: () => set({ query: "", testament: "all", language: "ne", priority: "nepali" }),
}));
