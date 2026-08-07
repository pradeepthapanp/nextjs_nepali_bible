"use client";

import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ARTICLE_SEARCH_DEBOUNCE_MS } from "../constants";
import { useSearchArticles } from "../queries";
import { useArticleSearchStore } from "../store";

/**
 * useArticleSearch — the search behavior for the article list (mirrors the
 * Music `useSongSearch`: Flutter's repo has `searchArticles` but no search UI,
 * so this is a web refinement).
 *
 * Composes:
 * - `useArticleSearchStore` (Zustand) — the input `query` + `isSearching` flag
 *   (UI state);
 * - the shared `useDebouncedValue` (`@/hooks`) at
 *   `ARTICLE_SEARCH_DEBOUNCE_MS` (400ms — the Flutter `Debouncer` port);
 * - `useSearchArticles(debouncedQuery)` (React Query) — the results
 *   (`search(query)` cache), gated on a non-empty query.
 *
 * The result list lives in React Query; this hook only orchestrates the input
 * → debounce → query wiring (no search logic is duplicated).
 */
export function useArticleSearch() {
  const query = useArticleSearchStore((state) => state.query);
  const isSearching = useArticleSearchStore((state) => state.isSearching);
  const setQuery = useArticleSearchStore((state) => state.setQuery);
  const clear = useArticleSearchStore((state) => state.clear);

  const debouncedQuery = useDebouncedValue(query, ARTICLE_SEARCH_DEBOUNCE_MS);
  const results = useSearchArticles(debouncedQuery);

  return {
    query,
    debouncedQuery,
    isSearching,
    results,
    setQuery,
    clear,
  };
}
