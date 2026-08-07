"use client";

import type { SongCategory } from "@features/music/types";
import { CategorySelector } from "../category/category-selector";

export interface SearchFiltersProps {
  categories: readonly SongCategory[];
  selected: SongCategory;
  onSelect?: (category: SongCategory) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * SearchFilters — the category filter row shown with search results. Reuses
 * `CategorySelector` (which composes `CategoryChip`) — no chip rendering is
 * duplicated.
 */
export function SearchFilters(props: SearchFiltersProps) {
  return <CategorySelector {...props} />;
}
