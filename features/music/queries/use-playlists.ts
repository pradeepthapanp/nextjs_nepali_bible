"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMusicServices } from "../services";
import type { Playlist, Song } from "../types";
import { musicKeys } from "./query-keys";

/**
 * Playlist queries + mutations — the React Query replacement for
 * `PlaylistNotifier` (`lib/providers/music/playlist_provider.dart`).
 *
 * The playlist list is server state owned by the React Query cache
 * (`musicKeys.playlists.all()`). `usePlaylist` shares the SAME cache entry +
 * fetch as `usePlaylists` (React Query dedupes), so there is no duplicate
 * fetch or query logic.
 *
 * MUTATIONS — network-first (not optimistic), because Flutter awaits the
 * repository call before updating its state (`await createPlaylist(...)`
 * then `state = AsyncData(...)`). On success we write the exact server
 * result into the cache (`setQueryData`) — the web equivalent of Flutter's
 * local state update, with no refetch.
 */

/** The current user's playlists (replaces `PlaylistNotifier.build`). */
export function usePlaylists() {
  return useQuery({
    queryKey: musicKeys.playlists.all(),
    queryFn: () => getMusicServices().playlist.fetchPlaylists(),
  });
}

/** A single playlist, derived from the shared playlists cache (no extra fetch). */
export function usePlaylist(id: string) {
  const playlists = usePlaylists();
  const data = playlists.data?.find((playlist) => playlist.id === id) ?? null;
  return { ...playlists, data };
}

/** Port of `PlaylistNotifier._sortPlaylists` (system first, then newest). */
function sortPlaylists(playlists: Playlist[]): Playlist[] {
  const sorted = [...playlists];
  sorted.sort((a, b) => {
    if (a.isSystem && !b.isSystem) return -1;
    if (!a.isSystem && b.isSystem) return 1;
    return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
  });
  return sorted;
}

/** Create a playlist (replaces `PlaylistNotifier.createPlaylist`). */
export function useCreatePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; description?: string }) =>
      getMusicServices().playlist.createPlaylist(input),
    onSuccess: (playlist) => {
      queryClient.setQueryData<Playlist[]>(
        musicKeys.playlists.all(),
        (current = []) => sortPlaylists([playlist, ...current]),
      );
    },
  });
}

/** Update a playlist's name/description (replaces `PlaylistNotifier.updatePlaylist`). */
export function useUpdatePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (playlist: Playlist) =>
      getMusicServices().playlist.updatePlaylist(playlist),
    onSuccess: (_data, playlist) => {
      queryClient.setQueryData<Playlist[]>(
        musicKeys.playlists.all(),
        (current = []) =>
          current.map((entry) => (entry.id === playlist.id ? playlist : entry)),
      );
    },
  });
}

/** Delete a playlist (replaces `PlaylistNotifier.deletePlaylist`). */
export function useDeletePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (playlistId: string) =>
      getMusicServices().playlist.deletePlaylist(playlistId),
    onSuccess: (_data, playlistId) => {
      queryClient.setQueryData<Playlist[]>(
        musicKeys.playlists.all(),
        (current = []) => current.filter((entry) => entry.id !== playlistId),
      );
      // Drop the now-deleted playlist's songs cache to avoid staleness.
      queryClient.removeQueries({ queryKey: musicKeys.playlists.songs(playlistId) });
    },
  });
}

/** Remove every song from a playlist (replaces `PlaylistNotifier.clearPlaylist`). */
export function useClearPlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (playlistId: string) =>
      getMusicServices().playlist.clearPlaylist(playlistId),
    onSuccess: (_data, playlistId) => {
      queryClient.setQueryData<Song[]>(musicKeys.playlists.songs(playlistId), []);
    },
  });
}
