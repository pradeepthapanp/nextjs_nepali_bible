"use client";

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import { getArticleServices } from "../services";
import type { Article } from "../types";
import { articlesKeys } from "./query-keys";

/**
 * Article mutations — the React Query replacement for the `ArticlesNotifier`
 * create/update/delete/increment flows
 * (`lib/providers/articles/articles_provider.dart`).
 *
 * Strategy (mirrors the architecture README):
 *   - `createArticle` / `updateArticle` are NETWORK-FIRST: Flutter awaits the
 *     repo (which returns the server row) before touching its list, so the web
 *     writes the returned row into the cache (`setQueryData`) then reconciles.
 *   - `deleteArticle` is OPTIMISTIC: removed from the cache immediately,
 *     rolled back on error. (The featured-image file cleanup already happens
 *     inside the shared `ArticleService.deleteArticle` — not duplicated here.)
 *   - `incrementViewCount` is OPTIMISTIC +1 in the list AND detail caches.
 *
 * Targeted invalidation: `articlesKeys.lists()` is a PREFIX of
 * `articlesKeys.infinite()`, so invalidating `lists()` refreshes both the
 * finite `useArticles` and the infinite `useInfiniteArticles` with one call.
 * The article's category list is invalidated too (a created/updated/deleted
 * article changes it), and update also clears the OLD category when it changed.
 */

/** Rewrites the pages of the infinite library list (mirrors Songs' `mutateInfinite`). */
function mutateArticlePages(
  queryClient: QueryClient,
  mutate: (pages: Article[][]) => Article[][],
): Article[][] | undefined {
  const current = queryClient.getQueryData<InfiniteData<Article[]>>(
    articlesKeys.infinite(),
  );
  if (!current) return undefined;
  const previous = current.pages;
  queryClient.setQueryData<InfiniteData<Article[]>>(articlesKeys.infinite(), (data) => ({
    pages: data ? mutate(data.pages) : [],
    pageParams: data?.pageParams ?? [],
  }));
  return previous;
}

/**
 * Create an article (replaces `ArticlesNotifier.createArticle`). Network-first:
 * the server row is prepended to the list + written to the detail cache on
 * success (Flutter prepends the created row), then lists/category are
 * invalidated to reconcile the offset pagination.
 */
export function useCreateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (article: Article) =>
      getArticleServices().article.createArticle(article),
    onSuccess: (created) => {
      mutateArticlePages(queryClient, (pages) =>
        pages.length > 0 ? [[created, ...pages[0]], ...pages.slice(1)] : [[created]],
      );
      queryClient.setQueryData(articlesKeys.detail(created.id), created);
    },
    onSettled: (_data, _error, article) => {
      void queryClient.invalidateQueries({ queryKey: articlesKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: articlesKeys.byCategory(article.category),
      });
    },
  });
}

/**
 * Update an article (replaces `ArticlesNotifier.updateArticle`). Network-first:
 * the server row replaces the cached one on success (Flutter maps it in place),
 * then lists/detail/category are invalidated — including the OLD category list
 * if the category changed.
 */
export function useUpdateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (article: Article) =>
      getArticleServices().article.updateArticle(article),
    onMutate: (article) => {
      // Capture the pre-mutation article (its category) for targeted
      // invalidation of the old category list when the category changes.
      const previous = queryClient.getQueryData<Article>(
        articlesKeys.detail(article.id),
      );
      return { previous };
    },
    onSuccess: (updated) => {
      mutateArticlePages(queryClient, (pages) =>
        pages.map((page) =>
          page.map((entry) => (entry.id === updated.id ? updated : entry)),
        ),
      );
      queryClient.setQueryData(articlesKeys.detail(updated.id), updated);
    },
    onSettled: (_data, _error, article, context) => {
      void queryClient.invalidateQueries({ queryKey: articlesKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: articlesKeys.detail(article.id) });
      void queryClient.invalidateQueries({
        queryKey: articlesKeys.byCategory(article.category),
      });
      const oldCategory = context?.previous?.category;
      if (oldCategory && oldCategory !== article.category) {
        void queryClient.invalidateQueries({
          queryKey: articlesKeys.byCategory(oldCategory),
        });
      }
    },
  });
}

/**
 * Delete an article (replaces `ArticlesNotifier.deleteArticle`). Optimistic:
 * removed from the list immediately + detail cache dropped, rolled back on
 * error, lists/category invalidated on settle. (The featured-image file delete
 * is handled by the shared `ArticleService.deleteArticle` — not duplicated.)
 */
export function useDeleteArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (article: Article) =>
      getArticleServices().article.deleteArticle(article),
    onMutate: (article) => {
      const previous = mutateArticlePages(queryClient, (pages) =>
        pages.map((page) => page.filter((entry) => entry.id !== article.id)),
      );
      queryClient.removeQueries({ queryKey: articlesKeys.detail(article.id) });
      return { previous };
    },
    onError: (_error, _article, context) => {
      if (context?.previous) {
        queryClient.setQueryData<InfiniteData<Article[]>>(
          articlesKeys.infinite(),
          (data) => ({
            pages: context.previous as Article[][],
            pageParams: data?.pageParams ?? [],
          }),
        );
      }
    },
    onSettled: (_data, _error, article) => {
      void queryClient.invalidateQueries({ queryKey: articlesKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: articlesKeys.byCategory(article.category),
      });
    },
  });
}

/**
 * Increment view count (replaces `ArticlesNotifier.incrementViewCount`).
 * Optimistic +1 in the list AND detail caches (Flutter bumps the in-memory
 * copy before awaiting the repo write). The caller passes the article id and
 * its CURRENT count (the service writes `currentCount + 1`, a faithful port).
 */
export function useIncrementViewCount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, currentCount }: { id: string; currentCount: number }) =>
      getArticleServices().article.incrementViewCount(id, currentCount),
    onMutate: ({ id }) => {
      const bump = (article: Article): Article => ({
        ...article,
        viewCount: article.viewCount + 1,
      });
      mutateArticlePages(queryClient, (pages) =>
        pages.map((page) =>
          page.map((entry) => (entry.id === id ? bump(entry) : entry)),
        ),
      );
      const detail = queryClient.getQueryData<Article>(articlesKeys.detail(id));
      if (detail) queryClient.setQueryData(articlesKeys.detail(id), bump(detail));
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: articlesKeys.lists() });
    },
  });
}
