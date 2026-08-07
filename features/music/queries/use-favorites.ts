"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMusicServices } from "../services";
import type { Playlist, Song } from "../types";
import { musicKeys } from "./query-keys";

/**
 * Favorites queries + toggle — derived from the system "Favorites" playlist.
 *
 * Favorites in Flutter are the system playlist (`is_system: true`, named
 * "Favorites"); the drawer's Favorites entry navigates to
 * `PlaylistSongsPage(favoritesPlaylist)`.
 *
 * - `useFavorites` owns the favorites playlist row
 *   (`musicKeys.playlists.favorites()`).
 * - `useFavoriteSongs` owns the favorites songs list
 *   (`musicKeys.playlists.songs(favoritesId)`), disabled until the
 *   favorites playlist id is known.
 */

/** The system "Favorites" playlist, or null (replaces `getFavoritesPlaylist`). */
export function useFavorites() {
  return useQuery({
    queryKey: musicKeys.playlists.favorites(),
    queryFn: () => getMusicServices().playlist.getFavoritesPlaylist(),
  });
}

/** The songs in the system Favorites playlist. */
export function useFavoriteSongs() {
  const favorites = useFavorites();
  const favoritesId = favorites.data?.id;
  return useQuery({
    queryKey: musicKeys.playlists.songs(favoritesId ?? ""),
    queryFn: () =>
      getMusicServices().playlistSong.fetchPlaylistSongs(favoritesId as string),
    enabled: Boolean(favoritesId),
  });
}

/**
 * Toggle a song in/out of Favorites.
 *
 * - `mutationFn` ensures the system Favorites playlist exists (get or create),
 *   asks the server whether the song is present (`songExistsInPlaylist`), then
 *   adds/removes it. The `created` flag tells `onSettled` whether the
 *   playlists list must be refreshed because a new system playlist appeared.
 * - `onMutate` optimistically toggles the favorites songs cache when the
 *   favorites playlist is already known (rollback on error). It does NOT read
 *   the cache to decide the server call — `mutationFn` uses the server, so the
 *   optimistic paint and the network op never fight.
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (song: Song) => {
      const services = getMusicServices();
      const existing = await services.playlist.getFavoritesPlaylist();
      // Get or create the system Favorites playlist.
      const favorites: Playlist = existing ?? {
        id: await services.playlist.createFavoritesPlaylist(),
        name: "Favorites",
        description: "Your favorite songs",
        isPublic: false,
        isSystem: true,
        synced: true,
        deleted: false,
      };
      if (!existing) {
        queryClient.setQueryData(musicKeys.playlists.favorites(), favorites);
      }

      const exists = await services.playlistSong.songExistsInPlaylist({
        playlistId: favorites.id,
        songId: song.id,
      });
      if (exists) {
        await services.playlistSong.removeSongFromPlaylist({
          playlistId: favorites.id,
          songId: song.id,
        });
      } else {
        await services.playlistSong.addSongToPlaylist({
          playlistId: favorites.id,
          songId: song.id,
        });
      }
      return { playlistId: favorites.id, created: !existing };
    },
    onMutate: async (song) => {
      const favorites = queryClient.getQueryData<Playlist | null>(
        musicKeys.playlists.favorites(),
      );
      if (!favorites) return undefined;
      const key = musicKeys.playlists.songs(favorites.id);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Song[]>(key);
      queryClient.setQueryData<Song[]>(key, (current = []) => {
        const exists = current.some((entry) => entry.id === song.id);
        return exists
          ? current.filter((entry) => entry.id !== song.id)
          : [...current, song];
      });
      return { previous, playlistId: favorites.id };
    },
    onError: (_error, _song, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          musicKeys.playlists.songs(context.playlistId),
          context.previous,
        );
      }
    },
    onSettled: (data, _error, _song, context) => {
      const playlistId = data?.playlistId ?? context?.playlistId;
      if (playlistId) {
        void queryClient.invalidateQueries({
          queryKey: musicKeys.playlists.songs(playlistId),
        });
      }
      // A newly created system playlist must appear in the playlists list.
      if (data?.created) {
        void queryClient.invalidateQueries({ queryKey: musicKeys.playlists.all() });
      }
      void queryClient.invalidateQueries({
        queryKey: musicKeys.playlists.favorites(),
      });
    },
  });
}
