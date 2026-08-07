"use client";

import { create } from "zustand";

/**
 * Article search store — the client-only half of a web article search
 * (mirrors the Music `useSongSearchStore`: Flutter's repo has `searchArticles`
 * but no search UI, so this is a web refinement). The RESULT list lives in the
 * React Query cache (`articlesKeys.search(query)`); this store holds only the
 * input `query` and the `isSearching` flag so the list UI knows it is in
 * search mode without fetching extra data.
 *
 * NOT persisted — a refresh restarts search (same convention as the Music
 * search store).
 */
export interface ArticleSearchStore {
  query: string;
  isSearching: boolean;
  setQuery: (query: string) => void;
  clear: () => void;
}

/** Search input flags (UI state only; results live in React Query). */
export const useArticleSearchStore = create<ArticleSearchStore>()((set) => ({
  query: "",
  isSearching: false,
  setQuery: (query) => set({ query, isSearching: query.trim().length > 0 }),
  clear: () => set({ query: "", isSearching: false }),
}));
