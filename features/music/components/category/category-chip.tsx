"use client";

import type { SongCategory } from "@features/music/types";
import { categoryLabel } from "@features/music/utils";
import { cn } from "@/utils/cn";

export interface CategoryChipProps {
  category: SongCategory;
  selected?: boolean;
  onSelect?: (category: SongCategory) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * CategoryChip — one filter pill (the web equivalent of the horizontal
 * `SongCategory` chips in `music_display.dart`). Presentational and
 * controlled: `selected` + `onSelect` come from the parent (the category
 * store is driven by `useCategoryFilter` at the page level). Uses
 * `aria-pressed` and the pure `categoryLabel` for the label.
 */
export function CategoryChip({
  category,
  selected,
  onSelect,
  disabled,
  className,
}: CategoryChipProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(category)}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-foreground hover:bg-accent",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      {categoryLabel(category)}
    </button>
  );
}
