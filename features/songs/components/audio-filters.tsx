"use client";

import { Button } from "@/components/ui/button";
import { ALL_CATEGORY } from "../types";
import { cn } from "@/utils/cn";

export interface AudioFiltersProps {
  /** The distinct categories (from `fetchAudioCategories`). */
  categories: string[];
  /** The selected category (use `ALL_CATEGORY` for everything). */
  selected: string;
  onSelect: (category: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * AudioFilters — the category filter row (a web refinement: the Flutter
 * `AudiosListPage` has no filters, but the server exposes distinct categories
 * via `fetchAudioCategories`). Reuses the shared `Button` as accessible,
 * `aria-pressed` chips; selection is applied client-side.
 */
export function AudioFilters({
  categories,
  selected,
  onSelect,
  disabled,
  className,
}: AudioFiltersProps) {
  const options = [ALL_CATEGORY, ...categories];
  return (
    <div
      role="group"
      aria-label="Filter by category"
      className={cn("flex gap-2 overflow-x-auto pb-1", className)}
    >
      {options.map((category) => {
        const active = category === selected;
        return (
          <Button
            key={category}
            type="button"
            variant={active ? "secondary" : "outline"}
            size="sm"
            onClick={() => onSelect(category)}
            disabled={disabled}
            aria-pressed={active}
            className="shrink-0"
          >
            {category === ALL_CATEGORY ? "All" : category}
          </Button>
        );
      })}
    </div>
  );
}
