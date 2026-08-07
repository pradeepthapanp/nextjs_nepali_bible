"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { SONG_PAGE_SIZE } from "../constants";
import { getMusicServices } from "../services";
import type { SongCategory } from "../types";
import { musicKeys } from "./query-keys";

/**
 * Songs list queries — the React Query replacement for
 * `MusicNotifier` (`lib/providers/music/music_provider.dart`).
 *
 * Server state (the songs array + pagination) lives in the React Query cache
 * (`musicKeys.songsByCategory` / `musicKeys.songsInfinite`); the client-only
 * flags (`isSearching`, `searchQuery`) live in the song search store (UI
 * state — not part of React Query).
 *
 * `useSongs` is the single-page (page 0) view; `useInfiniteSongs` is the
 * infinite-scroll list that replaces `MusicNotifier.loadMore`/`refresh`.
 * They use DISTINCT cache keys (like the Bible module's finite search vs
 * `searchInfinite`) so a finite read never conflicts with the paginated one.
 */

/** Songs for a category, first page (replaces `MusicNotifier.build`).
 * `enabled` (default true) lets consumers compose the query conditionally
 * (e.g. the Song Reader only fetches the source it is currently on). */
export function useSongs(category: SongCategory, enabled = true) {
  return useQuery({
    queryKey: musicKeys.songsByCategory(category),
    queryFn: () =>
      category === "all"
        ? getMusicServices().song.getSongs(0)
        : getMusicServices().song.getSongsByCategory(category, 0),
    enabled,
  });
}

/**
 * Infinite-scroll songs for a category (replaces `MusicNotifier.loadMore` /
 * `refresh`). `pageParam` is the 0-based page; the service pages by
 * `page * SONG_PAGE_SIZE`. A full page means more pages exist (the same
 * `hasMore` heuristic as Flutter).
 */
export function useInfiniteSongs(category: SongCategory) {
  return useInfiniteQuery({
    queryKey: musicKeys.songsInfinite(category),
    queryFn: ({ pageParam }) =>
      category === "all"
        ? getMusicServices().song.getSongs(pageParam as number)
        : getMusicServices().song.getSongsByCategory(category, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === SONG_PAGE_SIZE ? allPages.length : undefined,
    placeholderData: (previous) => previous,
  });
}
