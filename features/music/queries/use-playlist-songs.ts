"use client";

import { useCallback, useMemo } from "react";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getMusicServices } from "../services";
import type { PlaylistSong, Song } from "../types";
import { musicKeys } from "./query-keys";

/**
 * Playlist songs queries + optimistic mutations — the React Query replacement
 * for `PlaylistSongNotifier` (family keyed by `playlistId`).
 *
 * The playlist's songs are server state owned by the React Query cache
 * (`musicKeys.playlists.songs(playlistId)`).
 *
 * MUTATIONS — OPTIMISTIC, because Flutter updates its state immediately
 * without awaiting the network (`_repo.addSongToPlaylist(...)` is
 * fire-and-forget, then `state = AsyncData([...current, song])`). This is
 * the exact pattern of `useHighlightMutations` in the Bible module:
 * onMutate (cancel → snapshot → setQueryData) → rollback onError →
 * invalidate onSettled so the server row order replaces the optimistic one.
 */

/** The songs of a playlist, in playlist order (replaces `PlaylistSongNotifier.build`).
 * `enabled` (default true) lets consumers compose the query conditionally. */
export function usePlaylistSongs(playlistId: string, enabled = true) {
  return useQuery({
    queryKey: musicKeys.playlists.songs(playlistId),
    queryFn: () =>
      getMusicServices().playlistSong.fetchPlaylistSongs(playlistId),
    enabled,
  });
}

/**
 * Per-playlist song counts for the playlist list page. Loads every playlist's
 * songs through the SAME cache entries as `usePlaylistSongs` (no duplicate
 * fetches — the detail page reuses these) and returns a `{ [playlistId]: n }`
 * map. Playlists with no songs / still loading count as 0.
 */
export function usePlaylistSongCounts(playlistIds: string[]) {
  const queries = useQueries({
    queries: playlistIds.map((id) => ({
      queryKey: musicKeys.playlists.songs(id),
      queryFn: () => getMusicServices().playlistSong.fetchPlaylistSongs(id),
      enabled: Boolean(id),
    })),
  });

  return useMemo(() => {
    const counts: Record<string, number> = {};
    playlistIds.forEach((id, index) => {
      counts[id] = queries[index]?.data?.length ?? 0;
    });
    return counts;
  }, [playlistIds, queries]);
}

/** Pure: moves an item from `from` to `to` (Flutter reorder semantics). */
function moveItem<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/**
 * add/remove/reorder/clear songs within a playlist (replaces
 * `PlaylistSongNotifier.addSong`/`removeSong`/`reorderSongs`/`clearPlaylist`).
 * Every mutation keys off `musicKeys.playlists.songs(playlistId)`.
 */
export function usePlaylistSongMutations(playlistId: string) {
  const queryClient = useQueryClient();
  const key = musicKeys.playlists.songs(playlistId);

  const add = useMutation({
    mutationFn: (song: Song) =>
      getMusicServices().playlistSong.addSongToPlaylist({
        playlistId,
        songId: song.id,
      }),
    onMutate: async (song) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Song[]>(key);
      queryClient.setQueryData<Song[]>(key, (current = []) =>
        current.some((entry) => entry.id === song.id)
          ? current
          : [...current, song],
      );
      return { previous };
    },
    onError: (_error, _song, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => void queryClient.invalidateQueries({ queryKey: key }),
  });

  const remove = useMutation({
    mutationFn: (songId: string) =>
      getMusicServices().playlistSong.removeSongFromPlaylist({
        playlistId,
        songId,
      }),
    onMutate: async (songId) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Song[]>(key);
      queryClient.setQueryData<Song[]>(key, (current = []) =>
        current.filter((entry) => entry.id !== songId),
      );
      return { previous };
    },
    onError: (_error, _songId, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => void queryClient.invalidateQueries({ queryKey: key }),
  });

  const reorder = useMutation({
    mutationFn: () => {
      // The cache already reflects the optimistic reorder from onMutate;
      // persist it as new positions (the web equivalent of updatePositions).
      const current = queryClient.getQueryData<Song[]>(key) ?? [];
      const positions: PlaylistSong[] = current.map((song, index) => ({
        playlistId,
        songId: song.id,
        position: index,
        synced: true,
        deleted: false,
      }));
      return getMusicServices().playlistSong.updatePositions(playlistId, positions);
    },
    onMutate: async (input: { from: number; to: number }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Song[]>(key);
      queryClient.setQueryData<Song[]>(key, (current = []) =>
        moveItem(current, input.from, input.to),
      );
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => void queryClient.invalidateQueries({ queryKey: key }),
  });

  const clear = useMutation({
    mutationFn: () => getMusicServices().playlist.clearPlaylist(playlistId),
    onSuccess: () => queryClient.setQueryData<Song[]>(key, []),
  });

  return { add, remove, reorder, clear };
}

/**
 * Membership lookup for the `AddToPlaylistDialog`: whether a given song is
 * already in each of the user's playlists.
 *
 * Uses TanStack `useQueries` (a stable hook call — no rules-of-hooks
 * violation) to load each playlist's songs through the SAME cache entry as
 * `usePlaylistSongs`, so opening the dialog never duplicates a fetch. Returns
 * a memoized `(playlistId) => boolean` predicate for the dialog's
 * `isInPlaylist` prop.
 */
export function usePlaylistMembership(playlistIds: string[], songId: string) {
  const queries = useQueries({
    queries: playlistIds.map((id) => ({
      queryKey: musicKeys.playlists.songs(id),
      queryFn: () => getMusicServices().playlistSong.fetchPlaylistSongs(id),
      enabled: Boolean(id),
    })),
  });

  return useCallback(
    (playlistId: string) => {
      const index = playlistIds.indexOf(playlistId);
      if (index < 0) return false;
      return (
        queries[index]?.data?.some((song) => song.id === songId) ?? false
      );
    },
    [playlistIds, queries, songId],
  );
}

/**
 * Toggle a song in/out of a SPECIFIC playlist (the per-row action behind the
 * `AddToPlaylistDialog`). Unlike `usePlaylistSongMutations`, the playlist is
 * chosen at call time (`{ playlistId, song, added }`), so a single mutation
 * serves every row. Optimistic + rollback + invalidate, mirroring
 * `usePlaylistSongMutations.add/remove`.
 */
export function useTogglePlaylistSong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      playlistId,
      song,
      added,
    }: {
      playlistId: string;
      song: Song;
      added: boolean;
    }) =>
      added
        ? getMusicServices().playlistSong.addSongToPlaylist({
            playlistId,
            songId: song.id,
          })
        : getMusicServices().playlistSong.removeSongFromPlaylist({
            playlistId,
            songId: song.id,
          }),
    onMutate: async ({ playlistId, song, added }) => {
      const key = musicKeys.playlists.songs(playlistId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Song[]>(key);
      queryClient.setQueryData<Song[]>(key, (current = []) =>
        added
          ? current.some((entry) => entry.id === song.id)
            ? current
            : [...current, song]
          : current.filter((entry) => entry.id !== song.id),
      );
      return { previous, playlistId };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          musicKeys.playlists.songs(context.playlistId),
          context.previous,
        );
      }
    },
    onSettled: (_data, _error, input) =>
      void queryClient.invalidateQueries({
        queryKey: musicKeys.playlists.songs(input.playlistId),
      }),
  });
}
