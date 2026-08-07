"use client";

import type { SongCategory } from "@features/music/types";
import { cn } from "@/utils/cn";
import { CategoryChip } from "./category-chip";

export interface CategorySelectorProps {
  categories: readonly SongCategory[];
  selected: SongCategory;
  onSelect?: (category: SongCategory) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * CategorySelector — the horizontal, scrollable row of category filter chips
 * (the web equivalent of the `ListView.separated` category bar in
 * `music_display.dart`). Presentational: receives the categories + selection
 * via props; composes `CategoryChip` (no duplicated rendering).
 */
export function CategorySelector({
  categories,
  selected,
  onSelect,
  disabled,
  className,
}: CategorySelectorProps) {
  return (
    <div
      role="group"
      aria-label="Filter by category"
      className={cn("flex gap-2 overflow-x-auto pb-1", className)}
    >
      {categories.map((category) => (
        <CategoryChip
          key={category}
          category={category}
          selected={category === selected}
          onSelect={onSelect}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
