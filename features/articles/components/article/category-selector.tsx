"use client";

import { ARTICLE_CATEGORY_ORDER } from "../../constants";
import type { ArticleCategory } from "../../types";
import { CategoryChip } from "./category-chip";
import { cn } from "@/utils/cn";

export interface CategorySelectorProps {
  value: ArticleCategory | "all";
  onChange: (category: ArticleCategory | "all") => void;
  /** Show the "All" chip first (default true). */
  showAll?: boolean;
  className?: string;
}

/**
 * CategorySelector — the category filter chip row (the web replacement of
 * Flutter's `_buildCategoryPicker` ChoiceChips). Presentational: the selected
 * value + onChange drive it; the filter state lives in the caller (e.g. the
 * `useArticleFilters` hook).
 */
export function CategorySelector({
  value,
  onChange,
  showAll = true,
  className,
}: CategorySelectorProps) {
  return (
    <div role="group" className={cn("flex flex-wrap gap-2", className)}>
      {showAll ? (
        <CategoryChip category="all" active={value === "all"} onClick={() => onChange("all")} />
      ) : null}
      {ARTICLE_CATEGORY_ORDER.map((category) => (
        <CategoryChip
          key={category}
          category={category}
          active={value === category}
          onClick={() => onChange(category)}
        />
      ))}
    </div>
  );
}
