"use client";

import { useCallback } from "react";
import { useArticle, useIncrementViewCount } from "../queries";
import { useRelatedArticles } from "./use-related-articles";

/**
 * useArticleDetail — the ArticleDetailsPage behavior (the web equivalent of
 * `ArticleDetailsPage`'s `articleByIdProvider` + `incrementViewCount` wiring):
 * the single-article query, the view-count bump and the related articles.
 *
 * Composes:
 * - `useArticle(id)` (React Query) — the article (`detail(id)` cache);
 * - `useRelatedArticles(article)` (behavior) — same-category related articles;
 * - `useIncrementViewCount` (React Query mutation) — optimistic +1 view count.
 *
 * `bumpViewCount` reads the CURRENT article's `viewCount` and fires the
 * optimistic mutation (Flutter bumps the count on pop). The page decides WHEN
 * to call it (once per article view — e.g. on mount/unmount), so the hook
 * stays free of render-timing side effects.
 */
export function useArticleDetail(id?: string) {
  const articleQuery = useArticle(id);
  const incrementViewCount = useIncrementViewCount();
  const article = articleQuery.data;
  const related = useRelatedArticles(article ?? undefined);

  /** Bump the article's view count (optimistic +1, server write via the service). */
  const bumpViewCount = useCallback(() => {
    if (!article) return;
    incrementViewCount.mutate({ id: article.id, currentCount: article.viewCount });
  }, [article, incrementViewCount]);

  return {
    article,
    isLoading: articleQuery.isLoading,
    isError: articleQuery.isError,
    error: articleQuery.error,
    refetch: articleQuery.refetch,
    related,
    bumpViewCount,
  };
}
