"use client";

import { SearchInput } from "@/components/ui/search-input";
import { useArticleSearch } from "../../hooks";
import { cn } from "@/utils/cn";

export interface ArticleSearchBarProps {
  className?: string;
}

/**
 * ArticleSearchBar — the article search input (a web refinement; Flutter's
 * repo has `searchArticles` but no search UI). Wraps the SHARED `SearchInput`
 * and COMPOSES `useArticleSearch` (store query → shared `useDebouncedValue` →
 * `useSearchArticles`). No search logic is duplicated here.
 */
export function ArticleSearchBar({ className }: ArticleSearchBarProps) {
  const { query, setQuery, clear } = useArticleSearch();
  return (
    <SearchInput
      label="Search articles"
      value={query}
      onValueChange={setQuery}
      onClear={clear}
      className={cn(className)}
    />
  );
}
