"use client";

import { useQuery } from "@tanstack/react-query";
import { SEARCH_MIN_QUERY_LENGTH } from "../constants";
import { getBibleServices } from "../services";
import type { SearchFilters, SearchResult } from "../types";
import { bibleKeys } from "./query-keys";

/**
 * Debounced verse search. The hook is disabled until the query is long enough,
 * so short/empty queries never hit the backend. The `useSearch` hook wires the
 * debounced input value into this.
 */
export function useSearchVerses(query: string, filters: SearchFilters) {
  return useQuery<SearchResult[]>({
    queryKey: bibleKeys.search(query, filters),
    queryFn: () =>
      getBibleServices().search.searchVerses(query, filters),
    enabled:
      query.trim().length >= SEARCH_MIN_QUERY_LENGTH,
    placeholderData: (previous) => previous,
  });
}
