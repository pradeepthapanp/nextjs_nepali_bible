"use client";

import { useCallback, useMemo } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { SEARCH_MIN_QUERY_LENGTH } from "../../constants";
import { useDeepLink } from "../../hooks";
import { useBibles } from "../../queries";
import { useReadingStore, useSearchStore } from "../../store";
import type { SearchFilters } from "../../types";
import { useInfiniteSearchVerses } from "../queries";
import { applyMatchMode, normalizeSearchQuery } from "../utils";
import { useSearchDeepLink } from "./use-search-deep-link";
import { useSearchHistory } from "./use-search-history";
import { useSearchSuggestions } from "./use-search-suggestions";

/**
 * The search feature composer — the single source of truth used by the
 * search page. It wires together, WITHOUT duplicating any of it:
 *   - `useSearchStore`            (raw query + filters),
 *   - `useDebouncedValue`         (instant search with 300ms debounce),
 *   - `useInfiniteSearchVerses`   (React Query infinite scroll over the
 *                                 existing search service),
 *   - `useSearchDeepLink`         (URL <-> store sync),
 *   - history + suggestions.
 *
 * Version resolution: the deep link's `v=`/`version=` wins, otherwise the
 * reader's current version is used ("current version" scope).
 */
export function useSearchFeature() {
  const search = useSearchStore();
  const { versionId: readingVersionId } = useReadingStore();
  const { data: versions } = useBibles();
  const { currentLink } = useDeepLink();

  const debouncedQuery = useDebouncedValue(search.query, 300);
  useSearchDeepLink(debouncedQuery);

  const { commit: commitHistory } = useSearchHistory();
  const suggestions = useSearchSuggestions(search.query);
  const { setQuery, setBookNumber } = search;

  // Resolve the version id from the deep link (v= id or version= shortcode).
  const specificVersionId = useMemo(() => {
    if (currentLink?.kind !== "search") return undefined;
    if (currentLink.versionId) return currentLink.versionId;
    if (currentLink.versionShortCode) {
      const code = currentLink.versionShortCode.toLowerCase();
      return versions?.find((version) => version.shortCode.toLowerCase() === code)
        ?.id;
    }
    return undefined;
  }, [currentLink, versions]);

  const filters = useMemo<SearchFilters>(
    () => ({
      versionId:
        search.versionScope === "all"
          ? undefined
          : (specificVersionId ?? readingVersionId),
      allVersions: search.versionScope === "all",
      testament: search.testament,
      language: search.language,
      priority: search.priority,
      bookNumber: search.bookNumber,
    }),
    [
      search.versionScope,
      search.testament,
      search.language,
      search.priority,
      search.bookNumber,
      specificVersionId,
      readingVersionId,
    ],
  );

  const infinite = useInfiniteSearchVerses(debouncedQuery, filters);

  // Flatten pages and apply the whole-word filter (partial/phrase pass through).
  const flatResults = useMemo(() => {
    const results = (infinite.data?.pages ?? []).flat();
    return applyMatchMode(results, debouncedQuery, search.matchMode);
  }, [infinite.data, debouncedQuery, search.matchMode]);

  const total = useMemo(
    () =>
      infinite.data?.pages.reduce(
        (count, page) => count + page.length,
        0,
      ) ?? 0,
    [infinite.data],
  );

  const commit = useCallback(() => {
    if (debouncedQuery.trim()) {
      commitHistory(normalizeSearchQuery(debouncedQuery));
    }
  }, [debouncedQuery, commitHistory]);

  const clear = useCallback(() => {
    setQuery("");
    setBookNumber(undefined);
  }, [setQuery, setBookNumber]);

  return {
    search,
    debouncedQuery,
    filters,
    results: { ...infinite, flatResults, total },
    suggestions,
    commit,
    clear,
    /** True once there is something (>= min length) to search for. */
    isReady: debouncedQuery.trim().length >= SEARCH_MIN_QUERY_LENGTH,
  };
}

export type SearchFeature = ReturnType<typeof useSearchFeature>;
