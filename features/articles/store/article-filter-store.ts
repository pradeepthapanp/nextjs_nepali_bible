"use client";

import { create } from "zustand";
import type { ArticleCategory } from "../types";

/**
 * Article filter store — client UI state for the list page's category filter
 * (mirrors the Music `useSongCategoryStore` / Online Songs `useSongSearchStore`
 * category). The articles themselves are server state owned by React Query
 * (`articlesKeys.byCategory`) — this store holds ONLY the selected chip.
 *
 * NOT persisted — Flutter's list has no filter state and a refresh restarts
 * the filter to "all" (same convention as the Music/Songs filter stores).
 */
export type ArticleFilterCategory = ArticleCategory | "all";

export interface ArticleFilterStore {
  /** The selected category chip; `"all"` shows every article. */
  category: ArticleFilterCategory;
  setCategory: (category: ArticleFilterCategory) => void;
}

/** Selected category filter chip (UI state only). */
export const useArticleFilterStore = create<ArticleFilterStore>()((set) => ({
  category: "all",
  setCategory: (category) => set({ category }),
}));
