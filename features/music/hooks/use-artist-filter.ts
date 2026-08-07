"use client";

import { useMemo, useState } from "react";
import { artistSort } from "../utils";
import { useArtistSorting } from "./use-artist-sorting";

/**
 * useArtistFilter — the artist list search + sort (the web equivalent of
 * `ArtistListPage`'s local name filter + `ArtistsNotifier.sortArtists`).
 *
 * Composes `useArtistSorting` (React Query artists + sort store) and applies
 * the pure `artistSort` utility plus a local name substring filter. The
 * artists are server state; only the filter query + sort preference are UI.
 */
export function useArtistFilter() {
  const [query, setQuery] = useState("");
  const { artists, sort, setSort } = useArtistSorting();

  const filtered = useMemo(() => {
    const sorted = artistSort(artists.data ?? [], sort);
    const q = query.trim().toLowerCase();
    return q
      ? sorted.filter((artist) => artist.name.toLowerCase().includes(q))
      : sorted;
  }, [artists.data, sort, query]);

  return { query, setQuery, artists, sort, setSort, filtered };
}
