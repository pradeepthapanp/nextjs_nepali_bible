"use client";

import { useArticleFilterStore } from "../store";

/**
 * useArticleFilters — the category filter behavior (mirrors the Music
 * `useSongCategoryStore` composition). A thin wrapper over the
 * `useArticleFilterStore` so the list UI reads one hook instead of selecting
 * store slices directly. The articles themselves are server state in React
 * Query; this only exposes the selected chip (UI state).
 */
export function useArticleFilters() {
  const category = useArticleFilterStore((state) => state.category);
  const setCategory = useArticleFilterStore((state) => state.setCategory);
  return { category, setCategory };
}
