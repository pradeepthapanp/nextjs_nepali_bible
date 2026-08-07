"use client";

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import { mediaPathFromUrl } from "@/utils/media";
import { getSongServices } from "../services";
import type { Audio } from "../types";
import { songsKeys } from "./query-keys";

/**
 * Audio mutations — the React Query replacement for the `AudioNotifier`
 * optimistic flows (`lib/providers/audio/audios_notifier_provider.dart`):
 * Flutter updates its state optimistically (a temp id for create, in-place
 * update/removal) and refetches after create. These mutations mirror that
 * with optimistic cache writes + rollback on error + invalidate on settle.
 */

/** Optimistically rewrite the pages of the infinite library list. */
function mutateInfinite(
  queryClient: QueryClient,
  mutate: (pages: Audio[][]) => Audio[][],
): Audio[][] | undefined {
  const current = queryClient.getQueryData<InfiniteData<Audio[]>>(songsKeys.infinite());
  if (!current) return undefined;
  const previous = current.pages;
  queryClient.setQueryData<InfiniteData<Audio[]>>(songsKeys.infinite(), (data) => ({
    pages: data ? mutate(data.pages) : [],
    pageParams: data?.pageParams ?? [],
  }));
  return previous;
}

/** Create an audio (replaces `createAudio` — optimistic temp id + refresh). */
export function useCreateAudio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (audio: Audio) => getSongServices().song.createAudio(audio),
    onMutate: (audio) => {
      const optimisticId = `temp_${Date.now()}`;
      const optimistic: Audio = { ...audio, id: optimisticId };
      mutateInfinite(queryClient, (pages) =>
        pages.length > 0 ? [[optimistic, ...pages[0]], ...pages.slice(1)] : [[optimistic]],
      );
      return { optimisticId };
    },
    onError: (_error, _audio, context) => {
      if (!context?.optimisticId) return;
      mutateInfinite(queryClient, (pages) =>
        pages.map((page) => page.filter((entry) => entry.id !== context.optimisticId)),
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: songsKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: songsKeys.categories() });
    },
  });
}

/** Update an audio (replaces `updateAudio` — optimistic in-place). */
export function useUpdateAudio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (audio: Audio) => getSongServices().song.updateAudio(audio),
    onMutate: (audio) => {
      mutateInfinite(queryClient, (pages) =>
        pages.map((page) =>
          page.map((entry) => (entry.id === audio.id ? audio : entry)),
        ),
      );
      queryClient.setQueryData(songsKeys.detail(audio.id), audio);
    },
    onSettled: (_data, _error, audio) => {
      void queryClient.invalidateQueries({ queryKey: songsKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: songsKeys.detail(audio.id) });
    },
  });
}

/** Delete an audio (replaces `deleteAudio` — optimistic + best-effort media cleanup). */
export function useDeleteAudio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (audio: Audio) => {
      const deletion = getSongServices().song.deleteAudio(audio.id);
      // Clean up media files best-effort after the row delete (Flutter's
      // `_deleteMediaFiles`).
      const paths = [mediaPathFromUrl(audio.audioUrl), mediaPathFromUrl(audio.artUrl)]
        .filter((path): path is string => Boolean(path));
      if (paths.length > 0) {
        void deletion.then(() => {
          for (const path of paths) {
            void getSongServices().upload.deleteFile(path).catch(() => undefined);
          }
        });
      }
      return deletion;
    },
    onMutate: (audio) => {
      const previous = mutateInfinite(queryClient, (pages) =>
        pages.map((page) => page.filter((entry) => entry.id !== audio.id)),
      );
      return { previous };
    },
    onError: (_error, _audio, context) => {
      if (context?.previous) {
        queryClient.setQueryData<InfiniteData<Audio[]>>(songsKeys.infinite(), (data) => ({
          pages: context.previous as Audio[][],
          pageParams: data?.pageParams ?? [],
        }));
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: songsKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: songsKeys.categories() });
    },
  });
}

/**
 * Optimistic play-count bump (replaces `incrementPlayCount`): +1 in the list
 * + detail caches, rolled back on error (no refetch — Flutter does not
 * refresh after an increment).
 */
export function useIncrementPlayCount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (audioId: string) =>
      getSongServices().song.incrementPlayCount(audioId),
    onMutate: (audioId) => {
      const bump = (audio: Audio): Audio => ({
        ...audio,
        playCount: audio.playCount + 1,
      });
      mutateInfinite(queryClient, (pages) =>
        pages.map((page) =>
          page.map((entry) => (entry.id === audioId ? bump(entry) : entry)),
        ),
      );
      const detail = queryClient.getQueryData<Audio>(songsKeys.detail(audioId));
      if (detail) queryClient.setQueryData(songsKeys.detail(audioId), bump(detail));
      return { audioId };
    },
    onError: (_error, _audioId) => {
      void queryClient.invalidateQueries({ queryKey: songsKeys.lists() });
    },
  });
}

