"use client";

import { useArtists } from "../queries";
import { useArtistSortStore } from "../store";

/**
 * useArtistSorting — the artist list sort behavior (the web equivalent of
 * `ArtistsNotifier.sortArtists`, which sorts the fetched list in memory).
 *
 * Composes `useArtists` (React Query) + `useArtistSortStore` (the `ArtistSort`
 * preference). The sorting itself is applied by `useArtistFilter` via the pure
 * `artistSort` utility — no business logic is duplicated here.
 */
export function useArtistSorting() {
  const artists = useArtists();
  const sort = useArtistSortStore((state) => state.sort);
  const setSort = useArtistSortStore((state) => state.setSort);
  return { artists, sort, setSort };
}
