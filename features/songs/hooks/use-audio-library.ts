"use client";

import { useCallback, useMemo } from "react";
import { useAudioCategories, useInfiniteAudios, useCurrentProfile, useDeleteAudio, flattenAudioPages } from "../queries";
import { useSongSearchStore } from "../store";
import type { Audio } from "../types";
import { audioMatchesCategory, audioMatchesQuery } from "../utils";

/**
 * useAudioLibrary — the AudioListPage behavior (the web equivalent of
 * `AudioNotifier` consumption in `audios_list_page.dart`): the paginated
 * library, client-side search + category filters, and the delete flow with the
 * admin gate. Server state stays in React Query; only the filter text +
 * category live in the store.
 */
export function useAudioLibrary() {
  const songs = useInfiniteAudios();
  const categoriesQuery = useAudioCategories();
  const deleteAudio = useDeleteAudio();
  const { canManage } = useCurrentProfile();

  const query = useSongSearchStore((state) => state.query);
  const category = useSongSearchStore((state) => state.category);
  const setQuery = useSongSearchStore((state) => state.setQuery);
  const setCategory = useSongSearchStore((state) => state.setCategory);

  const allAudios = useMemo(() => flattenAudioPages(songs.data), [songs.data]);

  /** Filtered view (client-side search + category). */
  const audios = useMemo(
    () =>
      allAudios.filter(
        (audio) =>
          audioMatchesQuery(audio, query) && audioMatchesCategory(audio, category),
      ),
    [allAudios, query, category],
  );

  const remove = useCallback(
    (audio: Audio) => deleteAudio.mutate(audio),
    [deleteAudio],
  );

  return {
    // Query state
    audios,
    isLoading: songs.isLoading,
    isError: songs.isError,
    error: songs.error,
    hasMore: Boolean(songs.hasNextPage),
    isLoadingMore: songs.isFetchingNextPage,
    loadMore: () => void songs.fetchNextPage(),
    refetch: () => void songs.refetch(),
    // Filters
    query,
    setQuery,
    category,
    setCategory,
    categories: categoriesQuery.data ?? [],
    // Admin
    canManage,
    deleteAudio: remove,
  };
}
