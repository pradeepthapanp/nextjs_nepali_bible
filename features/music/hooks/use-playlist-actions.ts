"use client";

import {
  useClearPlaylist,
  useCreatePlaylist,
  useDeletePlaylist,
  usePlaylistSongMutations,
  useUpdatePlaylist,
} from "../queries";
import { usePlaylistSelectionStore } from "../store";

/**
 * usePlaylistActions — intent-level playlist flows (the web equivalent of
 * `PlaylistNotifier` + `PlaylistSongNotifier` UI actions).
 *
 * Composes:
 * - the playlist mutations `useCreatePlaylist`/`useUpdatePlaylist`/
 *   `useDeletePlaylist`/`useClearPlaylist` (React Query);
 * - `usePlaylistSongMutations(selectedPlaylistId)` bound to the playlist
 *   currently selected in `PlaylistSelectionStore`.
 *
 * Exposes `create`, `update`, `remove`, `clear` (playlist-level) and `add`,
 * `removeSong`, `reorder`, `clearSongs` (song-level, on the selected
 * playlist). All return promises (`mutateAsync`) so callers can await + toast.
 */
export function usePlaylistActions() {
  const selectedPlaylistId = usePlaylistSelectionStore(
    (state) => state.selectedPlaylistId,
  );
  const createPlaylist = useCreatePlaylist();
  const updatePlaylist = useUpdatePlaylist();
  const deletePlaylist = useDeletePlaylist();
  const clearPlaylist = useClearPlaylist();
  const playlistSong = usePlaylistSongMutations(selectedPlaylistId ?? "");

  return {
    selectedPlaylistId,
    create: createPlaylist.mutateAsync,
    update: updatePlaylist.mutateAsync,
    remove: deletePlaylist.mutateAsync,
    clear: clearPlaylist.mutateAsync,
    add: playlistSong.add.mutateAsync,
    removeSong: playlistSong.remove.mutateAsync,
    reorder: playlistSong.reorder.mutateAsync,
    clearSongs: playlistSong.clear.mutateAsync,
  };
}
