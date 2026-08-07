"use client";

import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import type { Article } from "../../types";
import { ArticleCard } from "../article/article-card";
import { cn } from "@/utils/cn";

export interface SearchResultsProps {
  results: Article[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onOpen?: (article: Article) => void;
  className?: string;
}

/**
 * SearchResults — the article search result list (a web refinement). Reuses
 * the shared Loading/Error/Empty states + the `ArticleCard`. Presentational —
 * the results come from `useArticleSearch().results`.
 */
export function SearchResults({
  results,
  isLoading,
  isError,
  onRetry,
  onOpen,
  className,
}: SearchResultsProps) {
  if (isLoading) return <LoadingState label="Searching…" />;
  if (isError) {
    return (
      <ErrorState
        title="Search failed"
        description="Something went wrong while searching."
        onRetry={onRetry}
      />
    );
  }
  if (results.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="No articles found"
        description="Try a different search term."
      />
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {results.map((article) => (
        <ArticleCard key={article.id} article={article} onOpen={onOpen} />
      ))}
    </div>
  );
}
