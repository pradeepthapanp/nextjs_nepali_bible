"use client";

import { Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import type { Article } from "../../types";
import { ArticleCard } from "./article-card";
import { cn } from "@/utils/cn";

export interface ArticleListProps {
  articles: Article[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  onOpen?: (article: Article) => void;
  canManage?: boolean;
  onEdit?: (article: Article) => void;
  onDelete?: (article: Article) => void;
  className?: string;
}

/**
 * ArticleList — the article list surface (the web replacement of the
 * `ArticlesPage` list + its loading / error / empty states). Presentational:
 * it renders the shared LoadingState / ErrorState / EmptyState + the
 * `ArticleCard`s + a "Load more" button (Flutter's `loadMore` + trailing
 * spinner). The data + handlers come via props (the page composes
 * `useArticleLibrary`).
 */
export function ArticleList({
  articles,
  isLoading,
  isError,
  onRetry,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onOpen,
  canManage,
  onEdit,
  onDelete,
  className,
}: ArticleListProps) {
  if (isLoading) return <LoadingState label="Loading articles…" />;
  if (isError) {
    return (
      <ErrorState
        title="Error loading article!"
        description="Something went wrong while loading the articles."
        onRetry={onRetry}
      />
    );
  }
  if (articles.length === 0) {
    return (
      <EmptyState
        icon={Newspaper}
        title="Articles not found"
        description="No articles match here yet."
      />
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          onOpen={onOpen}
          canManage={canManage}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
      {hasMore ? (
        <Button
          type="button"
          variant="outline"
          onClick={onLoadMore}
          disabled={isLoadingMore}
          className="mt-2"
        >
          {isLoadingMore ? "Loading…" : "Load more"}
        </Button>
      ) : null}
    </div>
  );
}
