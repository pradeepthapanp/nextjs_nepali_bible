"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useArticleNavigationStore, type ArticleNavigationTarget } from "../store";
import type { ArticleCategory } from "../types";

/**
 * useArticleNavigation — the deep-link + pending-navigation behavior for the
 * Articles section (the counterpart to the Music module's `useMusicDeepLink`).
 *
 * The Articles routes are intentionally simple (`/articles`, `/articles/{id}`,
 * `/articles/new`, `/articles/edit/{id}`, `/articles?category=…`), so the URL
 * build/parse helpers live here as private pure functions (no separate
 * deep-link util needed — this is the ONLY place navigation is defined).
 *
 * Composes:
 * - the Next router (`useRouter` / `usePathname`) — `navigate` pushes a
 *   deep-link URL (browser history + refresh-safe location);
 * - `useArticleNavigationStore` (Zustand) — `pendingTarget` /
 *   `consumePendingTarget` (one-shot deep-link target applied once mounted).
 *
 * No navigation logic is duplicated across features; the article/category
 * targets are shared with the store type.
 */

export type ArticleRouteLink =
  | { kind: "list" }
  | { kind: "article"; articleId: string }
  | { kind: "new" }
  | { kind: "edit"; articleId: string };

/** Builds the URL for a navigation target (article detail / category list). */
export function buildArticleUrl(target: ArticleNavigationTarget): string {
  if (target.kind === "article") return `/articles/${target.articleId}`;
  return `/articles?category=${target.category}`;
}

/** Parses the current `/articles` route into a typed link (or null off-section). */
export function parseArticlePath(pathname: string): ArticleRouteLink | null {
  if (!pathname.startsWith("/articles")) return null;
  if (pathname === "/articles" || pathname === "/articles/") return { kind: "list" };
  if (pathname === "/articles/new") return { kind: "new" };
  const edit = pathname.match(/^\/articles\/edit\/([^/]+)$/);
  if (edit) return { kind: "edit", articleId: edit[1] };
  const article = pathname.match(/^\/articles\/([^/]+)$/);
  if (article) return { kind: "article", articleId: article[1] };
  return { kind: "list" };
}

export function useArticleNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const pendingTarget = useArticleNavigationStore((state) => state.pendingTarget);
  const setPendingTarget = useArticleNavigationStore(
    (state) => state.setPendingTarget,
  );

  /** Push a deep link (navigates + updates the URL). */
  const navigate = useCallback(
    (target: ArticleNavigationTarget) => router.push(buildArticleUrl(target)),
    [router],
  );

  /** Open an article detail page. */
  const openArticle = useCallback(
    (articleId: string) => router.push(`/articles/${articleId}`),
    [router],
  );

  /** Open a category-filtered list (the filter store applies it client-side). */
  const openCategory = useCallback(
    (category: ArticleCategory) =>
      router.push(`/articles?category=${category}`),
    [router],
  );

  /** Open the create-article page. */
  const openNew = useCallback(() => router.push("/articles/new"), [router]);

  /** Open the edit-article page. */
  const openEdit = useCallback(
    (articleId: string) => router.push(`/articles/edit/${articleId}`),
    [router],
  );

  /** The parsed route link of the current path (or null off `/articles`). */
  const currentLink = useMemo(() => parseArticlePath(pathname), [pathname]);

  /** Reads and clears the pending target (applied exactly once). */
  const consumePendingTarget = useCallback(
    () => useArticleNavigationStore.getState().consumePendingTarget(),
    [],
  );

  return {
    navigate,
    openArticle,
    openCategory,
    openNew,
    openEdit,
    currentLink,
    pendingTarget,
    setPendingTarget,
    consumePendingTarget,
  };
}
