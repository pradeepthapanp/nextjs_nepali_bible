"use client";

import { useQuery } from "@tanstack/react-query";
import { getMusicServices } from "../services";
import { musicKeys } from "./query-keys";

/**
 * Artist queries — the React Query replacement for the Flutter providers
 * `ArtistsNotifier` (all artists), `ArtistNotifier` (single artist) and
 * `ArtistSongsNotifier` (songs by artist).
 *
 * The `ArtistSort` preference is client UI state (the artist sort store +
 * `useArtistSorting`), applied locally to the cached list — the web
 * equivalent of `ArtistsNotifier.sortArtists`, which sorts the fetched list
 * in memory.
 */

/** Every artist, ordered by name (replaces `ArtistsNotifier.build`). */
export function useArtists() {
  return useQuery({
    queryKey: musicKeys.artists(),
    queryFn: () => getMusicServices().artist.getAllArtists(),
  });
}

/** Single artist by id; disabled until an id is known (replaces `artistProvider`). */
export function useArtist(id: string | undefined) {
  return useQuery({
    queryKey: musicKeys.artist(id ?? ""),
    queryFn: () => getMusicServices().artist.getArtistById(id ?? ""),
    enabled: Boolean(id),
  });
}

/** An artist's songs (replaces `artistSongsProvider`).
 * `enabled` (default true) lets consumers compose the query conditionally. */
export function useArtistSongs(artistId: string, enabled = true) {
  return useQuery({
    queryKey: musicKeys.songsByArtist(artistId),
    queryFn: () => getMusicServices().song.getSongsByArtist(artistId),
    enabled,
  });
}
