"use client";

import { useQuery } from "@tanstack/react-query";
import { getBibleServices } from "../services";
import { bibleKeys } from "./query-keys";

export interface UseEnglishVersesOptions {
  /** Whether to fetch (default true) — gates the query so no English request
   * fires while the "English Verses" toggle is off. */
  enabled?: boolean;
}

/**
 * English NIV parallel verses for a chapter — the parallel-English data for
 * the reader's "English Verses" toggle. Mirrors the chapter/cross-reference
 * query conventions:
 *   - keyed by the SAME book/chapter identifiers (`bibleKeys.englishVerses`);
 *   - the WHOLE chapter is fetched in ONE request (no N+1, no full-table);
 *   - `enabled` is driven by the reader setting, so disabling the toggle stops
 *     further requests while React Query keeps the last chapter cached for an
 *     instant toggle-back.
 */
export function useEnglishVerses(
  bookNumber: number,
  chapter: number,
  options: UseEnglishVersesOptions = {},
) {
  return useQuery({
    queryKey: bibleKeys.englishVerses(bookNumber, chapter),
    queryFn: () =>
      getBibleServices().bible.getEnglishVerses(bookNumber, chapter),
    enabled:
      (options.enabled ?? true) && Boolean(bookNumber && chapter),
  });
}
