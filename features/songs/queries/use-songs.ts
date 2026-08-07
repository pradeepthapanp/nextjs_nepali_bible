"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { AUDIO_PAGE_SIZE } from "../types";
import { getSongServices } from "../services";
import type { Audio } from "../types";
import { songsKeys } from "./query-keys";

/**
 * Audio list queries — the React Query replacement for `AudioNotifier`
 * (`lib/providers/audio/audios_notifier_provider.dart`): the paginated
 * library (`build` + `loadMore`, page size 20, `hasMore` when a full page
 * came back), a single audio (`getAudio`) and the distinct categories
 * (`fetchAudioCategories`). Server state lives in the React Query cache.
 */

/** Paginated library, newest first (replaces `AudioNotifier.build/loadMore`). */
export function useInfiniteAudios() {
  return useInfiniteQuery({
    queryKey: songsKeys.infinite(),
    queryFn: ({ pageParam }) =>
      getSongServices().song.getAudios({
        limit: AUDIO_PAGE_SIZE,
        offset: pageParam as number,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === AUDIO_PAGE_SIZE
        ? allPages.reduce((sum, page) => sum + page.length, 0)
        : undefined,
    placeholderData: (previous) => previous,
  });
}

/** A single audio by id (replaces `getAudio`); enabled once an id is known. */
export function useAudio(id: string | undefined) {
  return useQuery({
    queryKey: songsKeys.detail(id ?? ""),
    queryFn: () => getSongServices().song.getAudio(id as string),
    enabled: Boolean(id),
  });
}

/** Distinct, sorted categories (replaces `fetchAudioCategories`). */
export function useAudioCategories() {
  return useQuery({
    queryKey: songsKeys.categories(),
    queryFn: () => getSongServices().song.getCategories(),
  });
}

/** Flattened pages of the infinite library list. */
export function flattenAudioPages(
  data: { pages: Audio[][] } | undefined,
): Audio[] {
  return data?.pages.flatMap((page) => page) ?? [];
}
