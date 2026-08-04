"use client";

import { useMemo } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useSearchVerses } from "../queries";
import { useReadingStore, useSearchStore } from "../store";
import type { SearchFilters } from "../types";

/**
 * Search behavior: owns the debounced query + filter state (from
 * `search-store`), builds the `SearchFilters` (using the currently selected
 * version), and runs `useSearchVerses`. The future search page consumes this
 * single hook instead of wiring the pieces itself.
 */
export function useSearch() {
  const {
    query,
    testament,
    language,
    priority,
    setQuery,
    setTestament,
    setLanguage,
    setPriority,
    reset,
  } = useSearchStore();
  const { versionId } = useReadingStore();

  const debouncedQuery = useDebouncedValue(query, 300);

  const filters = useMemo<SearchFilters>(
    () => ({ versionId, testament, language, priority }),
    [versionId, testament, language, priority],
  );

  const results = useSearchVerses(debouncedQuery, filters);

  return {
    query,
    debouncedQuery,
    results,
    filters,
    setQuery,
    setTestament,
    setLanguage,
    setPriority,
    reset,
  };
}
