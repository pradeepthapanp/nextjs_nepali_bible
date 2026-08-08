"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  ARTICLE_CATEGORY_PAGE_SIZE,
  ARTICLE_PAGE_SIZE,
  ARTICLE_SEARCH_LIMIT,
  RELATED_ARTICLES_LIMIT,
  RELATED_CHAPTER_ARTICLES_LIMIT,
} from "../constants";
import { getArticleServices } from "../services";
import type { Article, ArticleCategory } from "../types";
import { articlesKeys } from "./query-keys";

/**
 * Article queries — the React Query replacement for the Flutter article
 * providers:
 *   - `useArticles` / `useInfiniteArticles` → `ArticlesNotifier` (`build` +
 *     `loadMore`, page size 10, `hasMore` on a full page);
 *   - `useArticle(id)` → `articleByIdProvider` (family, autoDispose);
 *   - `useArticlesByCategory(category)` → `ArticlesWithCategoryNotifier`
 *     (DEAD in Flutter — kept for parity);
 *   - `useSearchArticles(query)` → `searchArticles` (repo method, no Flutter UI
 *     — a web refinement);
 *   - `useRelatedArticles(article)` → a WEB-FIRST derivation (Flutter has no
 *     related-articles feature).
 *
 * All server state lives in the React Query cache (no Zustand). Every query
 * goes through the shared `ArticleServices` — never Supabase directly.
 */

/**
 * Paginated library, newest first (replaces `ArticlesNotifier.build` +
 * `loadMore`). `getNextPageParam` continues only while a full page came back;
 * `placeholderData` keeps the previous pages while loading the next.
 */
export function useInfiniteArticles() {
  return useInfiniteQuery({
    queryKey: articlesKeys.infinite(),
    queryFn: ({ pageParam }) =>
      getArticleServices().article.getArticles({
        limit: ARTICLE_PAGE_SIZE,
        offset: pageParam as number,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === ARTICLE_PAGE_SIZE
        ? allPages.reduce((sum, page) => sum + page.length, 0)
        : undefined,
    placeholderData: (previous) => previous,
  });
}

/** Flattened pages of the infinite library list. */
export function flattenArticlePages(
  data: { pages: Article[][] } | undefined,
): Article[] {
  return data?.pages.flatMap((page) => page) ?? [];
}

/**
 * First-page list (finite) — a convenience single-shot that mirrors the first
 * page of `ArticlesNotifier.build`. Uses `articlesKeys.lists()`, which is a
 * PREFIX of `articlesKeys.infinite()`: invalidating `lists()` refreshes both
 * this and the infinite list, so the two never drift.
 */
export function useArticles() {
  return useQuery({
    queryKey: articlesKeys.lists(),
    queryFn: () =>
      getArticleServices().article.getArticles({
        limit: ARTICLE_PAGE_SIZE,
        offset: 0,
      }),
  });
}

/**
 * A single article by id (replaces `articleByIdProvider` family). Enabled once
 * an id is known (web-first deep-link resolution); returns `Article | null`.
 */
export function useArticle(id: string | undefined) {
  return useQuery({
    queryKey: articlesKeys.detail(id ?? ""),
    queryFn: () => getArticleServices().article.getArticle(id as string),
    enabled: Boolean(id),
  });
}

/**
 * First page of a category's articles (replaces
 * `ArticlesWithCategoryNotifier.build`; DEAD in Flutter — parity/optional).
 */
export function useArticlesByCategory(category: ArticleCategory) {
  return useQuery({
    queryKey: articlesKeys.byCategory(category),
    queryFn: () =>
      getArticleServices().article.getArticlesByCategory(category, {
        limit: ARTICLE_CATEGORY_PAGE_SIZE,
        offset: 0,
      }),
  });
}

/**
 * Published articles tied to a Bible chapter — the web-first internal-linking
 * query that powers the Bible reader's "Related articles" section. Reuses the
 * existing `related_book_number`/`related_chapter` article columns. Disabled
 * until a book+chapter is known.
 */
export function useArticlesByRelatedChapter(
  bookNumber?: number,
  chapter?: number,
) {
  return useQuery({
    queryKey: articlesKeys.byRelatedChapter(bookNumber ?? 0, chapter ?? 0),
    queryFn: () =>
      getArticleServices().article.getArticlesByRelatedChapter(
        bookNumber as number,
        chapter as number,
        { limit: RELATED_CHAPTER_ARTICLES_LIMIT },
      ),
    enabled: Boolean(bookNumber && chapter),
  });
}

/**
 * Title search (replaces `searchArticles`; no Flutter UI — a web refinement).
 * Enabled only once a non-empty query is present so an empty box fetches
 * nothing. Debouncing is a behavior-hook concern (`hooks/` phase).
 */
export function useSearchArticles(query: string) {
  return useQuery({
    queryKey: articlesKeys.search(query),
    queryFn: () =>
      getArticleServices().article.searchArticles(query.trim(), {
        limit: ARTICLE_SEARCH_LIMIT,
      }),
    enabled: query.trim().length > 0,
  });
}

/**
 * Related articles QUERY — a WEB-FIRST derivation (Flutter has no
 * related-articles feature; the `relatedBookNumber`/`relatedChapter` columns
 * exist but no repo method uses them). Reuses the SAME
 * `articlesKeys.byCategory(category)` cache as `useArticlesByCategory` (no
 * duplicated Supabase call), then picks the newest `RELATED_ARTICLES_LIMIT`
 * articles excluding the current one.
 *
 * Named `useRelatedArticlesQuery` so the BEHAVIOR hook `useRelatedArticles`
 * (in `hooks/`) can own the public name without a barrel collision.
 */
export function useRelatedArticlesQuery(
  article: Pick<Article, "id" | "category"> | undefined,
) {
  const category = article?.category ?? "other";
  const { data, ...query } = useQuery({
    queryKey: articlesKeys.byCategory(category),
    queryFn: () =>
      getArticleServices().article.getArticlesByCategory(category, {
        limit: ARTICLE_CATEGORY_PAGE_SIZE,
        offset: 0,
      }),
    enabled: Boolean(article),
  });
  const related = (data ?? [])
    .filter((entry) => entry.id !== article?.id)
    .slice(0, RELATED_ARTICLES_LIMIT);
  return { ...query, data: related };
}
