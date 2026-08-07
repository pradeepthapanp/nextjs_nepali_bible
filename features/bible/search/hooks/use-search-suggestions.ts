"use client";

import { useMemo } from "react";
import type { SearchSuggestion } from "../types";
import { DEFAULT_SEARCH_SUGGESTIONS, filterSuggestions } from "../utils";

/**
 * Search suggestions for the empty/typing state — the default quick chips,
 * filtered by the current query prefix.
 */
export function useSearchSuggestions(query: string): SearchSuggestion[] {
  return useMemo(
    () => filterSuggestions(DEFAULT_SEARCH_SUGGESTIONS, query),
    [query],
  );
}
