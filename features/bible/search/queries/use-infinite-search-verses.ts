"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { SEARCH_MIN_QUERY_LENGTH, SEARCH_PAGE_SIZE } from "../../constants";
import { getBibleServices } from "../../services";
import { bibleKeys } from "../../queries";
import type { SearchFilters, SearchResult } from "../../types";
import { normalizeSearchQuery } from "../utils";

/**
 * useInfiniteSearchVerses — infinite-scroll verse search.
 *
 * Reuses the existing search service (`getBibleServices().search`) and cache
 * keys (`bibleKeys.searchInfinite`); it only adds React Query pagination on
 * top. `pageParam` is the row offset; the service returns `SEARCH_PAGE_SIZE`
 * rows per page. The one-shot `useSearchVerses` remains for callers that do
 * not need pagination.
 */
export function useInfiniteSearchVerses(
  query: string,
  filters: SearchFilters,
) {
  const normalized = normalizeSearchQuery(query);
  const baseFilters: SearchFilters = { ...filters, offset: undefined };

  return useInfiniteQuery<SearchResult[]>({
    queryKey: bibleKeys.searchInfinite(normalized, baseFilters),
    queryFn: ({ pageParam }) =>
      getBibleServices().search.searchVerses(normalized, {
        ...baseFilters,
        offset: pageParam as number,
        limit: SEARCH_PAGE_SIZE,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === SEARCH_PAGE_SIZE
        ? allPages.length * SEARCH_PAGE_SIZE
        : undefined,
    enabled: normalized.length >= SEARCH_MIN_QUERY_LENGTH,
    placeholderData: (previous) => previous,
  });
}
