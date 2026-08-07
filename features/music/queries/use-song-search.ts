"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { SONG_PAGE_SIZE, SONG_SEARCH_MIN_QUERY_LENGTH } from "../constants";
import { getMusicServices } from "../services";
import type { SongCategory } from "../types";
import { normalizeSongQuery } from "../utils";
import { musicKeys } from "./query-keys";

/**
 * Song search queries — the React Query replacement for
 * `MusicNotifier.search` / `clearSearch`. Reuses `SongService.searchSongs`
 * (a direct port of the repository `searchSongs`) with infinite scroll,
 * mirroring `useInfiniteSearchVerses` in the Bible module.
 *
 * - `useSearchSongs` is the single-page (page 0) search result;
 * - `useInfiniteSongSearch` is the paginated results list.
 *
 * Both are gated on `SONG_SEARCH_MIN_QUERY_LENGTH` (web refinement; Flutter
 * fired on every non-empty query) and use DISTINCT cache keys
 * (`songSearch` vs `songSearchInfinite`), exactly like the Bible module.
 */

/** Single-page song search results (replaces `MusicNotifier.search`). */
export function useSearchSongs(query: string, category: SongCategory) {
  const normalized = normalizeSongQuery(query);
  return useQuery({
    queryKey: musicKeys.songSearch(normalized, category),
    queryFn: () => getMusicServices().song.searchSongs(normalized, 0),
    enabled: normalized.length >= SONG_SEARCH_MIN_QUERY_LENGTH,
  });
}

/** Infinite-scroll song search (replaces `MusicNotifier.loadMore` in search). */
export function useInfiniteSongSearch(query: string, category: SongCategory) {
  const normalized = normalizeSongQuery(query);
  return useInfiniteQuery({
    queryKey: musicKeys.songSearchInfinite(normalized, category),
    queryFn: ({ pageParam }) =>
      getMusicServices().song.searchSongs(
        normalized,
        pageParam as number,
        SONG_PAGE_SIZE,
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === SONG_PAGE_SIZE ? allPages.length : undefined,
    enabled: normalized.length >= SONG_SEARCH_MIN_QUERY_LENGTH,
    placeholderData: (previous) => previous,
  });
}
