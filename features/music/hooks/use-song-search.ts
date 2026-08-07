"use client";

import { useCallback, useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { SONG_SEARCH_DEBOUNCE_MS } from "../constants";
import { useSearchSongs } from "../queries";
import { useSongCategoryStore, useSongSearchStore } from "../store";
import { pushRecentSearch } from "../utils";

/**
 * useSongSearch — the search behavior for the song list (replaces
 * `MusicDisplay`'s `Debouncer` + `MusicNotifier.search` wiring).
 *
 * Composes:
 * - `SongSearchStore` (query/isSearching flags) + `SongCategoryStore` (the
 *   active category chip);
 * - `useSearchSongs` (React Query) gated on `SONG_SEARCH_MIN_QUERY_LENGTH`;
 * - the shared `useDebouncedValue` (`@/hooks`) at `SONG_SEARCH_DEBOUNCE_MS`;
 * - `pushRecentSearch` (pure) for a transient, capped recent-searches list,
 *   recorded on explicit `submit` (a user event — never in an effect);
 * - `suggestions` is a FUTURE-READY placeholder — a real suggestion engine
 *   plugs in here; it is intentionally empty.
 */
export function useSongSearch() {
  const query = useSongSearchStore((state) => state.query);
  const isSearching = useSongSearchStore((state) => state.isSearching);
  const setQuery = useSongSearchStore((state) => state.setQuery);
  const clear = useSongSearchStore((state) => state.clear);
  const category = useSongCategoryStore((state) => state.category);

  const debouncedQuery = useDebouncedValue(query, SONG_SEARCH_DEBOUNCE_MS);
  const results = useSearchSongs(debouncedQuery, category);

  // Recent searches: transient local history (capped + deduped via the pure
  // helper), recorded when the user explicitly submits a query.
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  /** Future-ready suggestion surface (no engine yet). */
  const suggestions: string[] = [];

  /** Submit a query: update the store AND record it in recent searches. */
  const submit = useCallback(
    (value: string) => {
      setQuery(value);
      setRecentSearches((recent) => pushRecentSearch(recent, value));
    },
    [setQuery],
  );

  return {
    query,
    debouncedQuery,
    isSearching,
    category,
    results,
    recentSearches,
    suggestions,
    setQuery,
    submit,
    clear,
  };
}
