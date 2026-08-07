"use client";

import { useCallback } from "react";
import {
  useFavoriteSongs as useFavoriteSongsQuery,
  useFavorites,
  useToggleFavorite,
} from "../queries";

/**
 * useFavoriteSongs — the favorites behavior (the web equivalent of the
 * Flutter favorites flow: the drawer's Favorites entry + per-song heart).
 *
 * Composes (all React Query — no duplication):
 * - `useFavorites` — the system Favorites playlist;
 * - `useFavoriteSongsQuery` — the favorite songs list;
 * - `useToggleFavorite` — the optimistic add/remove mutation.
 *
 * Exposes `favorites`, `favoriteSongs`, `isFavorite(songId)` and `toggle`
 * (the mutation object) / `toggleSong(song)` (awaitable).
 */
export function useFavoriteSongs() {
  const favorites = useFavorites();
  const favoriteSongs = useFavoriteSongsQuery();
  const toggle = useToggleFavorite();

  const isFavorite = useCallback(
    (songId: string) =>
      favoriteSongs.data?.some((song) => song.id === songId) ?? false,
    [favoriteSongs.data],
  );

  return { favorites, favoriteSongs, isFavorite, toggle, toggleSong: toggle.mutateAsync };
}

/** True when a song is in the system Favorites playlist. */
export function useIsFavorite(songId: string) {
  const favoriteSongs = useFavoriteSongsQuery();
  return favoriteSongs.data?.some((song) => song.id === songId) ?? false;
}
