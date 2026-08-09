"use client";

import { cn } from "@/utils/cn";

export interface NoteCategoryFilterProps {
  /** The available categories (from `useNoteLibrary`). */
  categories: string[];
  /** Selected category (null = "All"). */
  value: string | null;
  onChange: (category: string | null) => void;
}

/** Category chips (All + the note categories) — the Flutter `_buildFilterChip`. */
export function NoteCategoryFilter({
  categories,
  value,
  onChange,
}: NoteCategoryFilterProps) {
  const chips: { label: string; value: string | null }[] = [
    { label: "All", value: null },
    ...categories.map((category) => ({ label: category, value: category })),
  ];
  return (
    <div
      role="group"
      aria-label="Filter by category"
      className="flex flex-wrap gap-1.5"
    >
      {chips.map((chip) => {
        const active = value === chip.value;
        return (
          <button
            key={chip.label}
            type="button"
            onClick={() => onChange(chip.value)}
            aria-pressed={active}
            className={cn(
              "rounded-full border px-4 py-1 text-xs font-medium transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
