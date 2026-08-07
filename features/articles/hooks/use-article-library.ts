"use client";

import { useCallback, useMemo } from "react";
import {
  flattenArticlePages,
  useCurrentProfile,
  useDeleteArticle,
  useInfiniteArticles,
} from "../queries";
import type { Article } from "../types";
import { useArticleFilters } from "./use-article-filters";

/**
 * useArticleLibrary — the ArticlesListPage behavior (the web equivalent of
 * `ArticlesNotifier` consumption in `articles_page.dart`): the paginated
 * library, category filtering and the delete flow.
 *
 * Composes:
 * - `useInfiniteArticles` (React Query) — the paginated list (server state);
 * - `useArticleFilters` → `useArticleFilterStore` — the selected category chip
 *   (UI state) + the CLIENT-SIDE category filter (mirrors the Online Songs
 *   `useAudioLibrary`; articles have no server-side filter UI);
 * - `useDeleteArticle` (React Query mutation) — the delete flow.
 * - `useCurrentProfile` (React Query) — the admin/editor gate (`canManage`),
 *   via the SHARED `ProfileService` + `canManage` rule.
 *
 * Server data stays in React Query; only the category chip lives in the store.
 */
export function useArticleLibrary() {
  const articlesQuery = useInfiniteArticles();
  const deleteArticle = useDeleteArticle();
  const { canManage } = useCurrentProfile();
  const { category, setCategory } = useArticleFilters();

  const allArticles = useMemo(
    () => flattenArticlePages(articlesQuery.data),
    [articlesQuery.data],
  );

  /** Client-side category filter on the mapped enum category. */
  const articles = useMemo(
    () =>
      category === "all"
        ? allArticles
        : allArticles.filter((article) => article.category === category),
    [allArticles, category],
  );

  const remove = useCallback(
    (
      article: Article,
      callbacks?: { onSuccess?: () => void; onError?: () => void },
    ) => {
      deleteArticle.mutate(article, callbacks);
    },
    [deleteArticle],
  );

  return {
    // Query state
    articles,
    isLoading: articlesQuery.isLoading,
    isError: articlesQuery.isError,
    error: articlesQuery.error,
    hasMore: Boolean(articlesQuery.hasNextPage),
    isLoadingMore: articlesQuery.isFetchingNextPage,
    loadMore: () => void articlesQuery.fetchNextPage(),
    refetch: () => void articlesQuery.refetch(),
    // Category filter (UI state)
    category,
    setCategory,
    // Delete flow
    deleteArticle: remove,
    // Admin gating (admin / editor role)
    canManage,
  };
}
