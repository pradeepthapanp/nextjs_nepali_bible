"use client";

import { useInfiniteSongs } from "../queries";
import { useSongCategoryStore } from "../store";

/**
 * useCategoryFilter — the category chip filter for the song list.
 *
 * Composes `SongCategoryStore` (the selected `SongCategory` — UI state) with
 * `useInfiniteSongs` (React Query, keyed by that category). The songs are
 * server state; only the selected chip lives in the store.
 */
export function useCategoryFilter() {
  const category = useSongCategoryStore((state) => state.category);
  const setCategory = useSongCategoryStore((state) => state.setCategory);
  const songs = useInfiniteSongs(category);

  return { category, setCategory, songs };
}
