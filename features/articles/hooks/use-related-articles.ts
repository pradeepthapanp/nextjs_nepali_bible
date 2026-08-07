"use client";

import { useRelatedArticlesQuery } from "../queries";
import type { Article } from "../types";

/**
 * useRelatedArticles — the related-articles behavior for the article reader.
 * A thin wrapper over the `useRelatedArticlesQuery` (which reuses the SAME
 * `byCategory(category)` cache as `useArticlesByCategory`, filters the current
 * article out, and slices `RELATED_ARTICLES_LIMIT`). Adds no business logic —
 * it only exposes the derived list + the query surface to the reader.
 */
export function useRelatedArticles(
  article: Pick<Article, "id" | "category"> | undefined,
) {
  const query = useRelatedArticlesQuery(article);
  return {
    related: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
