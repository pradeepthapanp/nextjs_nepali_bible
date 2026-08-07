"use client";

import { ARTICLE_CATEGORY_LABELS } from "../../constants";
import type { ArticleCategory } from "../../types";
import { cn } from "@/utils/cn";

export interface CategoryChipProps {
  category: ArticleCategory | "all";
  /** Highlight the chip (the selected filter / the article's own category). */
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * CategoryChip — a single article-category label (the web replacement of
 * Flutter's category chips). Renders a `<span>` (or a `<button>` when
 * `onClick` is provided, e.g. for the filter selector). Purely presentational.
 */
export function CategoryChip({
  category,
  active,
  onClick,
  className,
}: CategoryChipProps) {
  const label = category === "all" ? "All" : ARTICLE_CATEGORY_LABELS[category];
  const classes = cn(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors",
    active
      ? "bg-primary text-primary-foreground"
      : "bg-primary/10 text-primary hover:bg-primary/15",
    onClick ? "cursor-pointer" : undefined,
    className,
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-pressed={active} className={classes}>
        {label}
      </button>
    );
  }
  return <span className={classes}>{label}</span>;
}
