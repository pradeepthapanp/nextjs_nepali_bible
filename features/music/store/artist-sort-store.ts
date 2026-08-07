"use client";

import { create } from "zustand";
import type { ArtistSort } from "../types";

/**
 * Artist sort store — the client-only sort preference behind
 * `ArtistsNotifier.sortArtists` (`lib/providers/music/artists_provider.dart`).
 *
 * The artist list itself is server state (React Query via
 * `musicKeys.artists()`); this store only holds the selected `ArtistSort`
 * and the hook `useArtistSorting` applies it locally to the cached list
 * (exactly like Flutter, which sorts the fetched list in memory). NOT
 * persisted — the sort is a per-session preference in Flutter.
 */
export interface ArtistSortStore {
  sort: ArtistSort;
  setSort: (sort: ArtistSort) => void;
}

/** Selected artist sort (UI state only). */
export const useArtistSortStore = create<ArtistSortStore>()((set) => ({
  sort: "nameAsc",
  setSort: (sort) => set({ sort }),
}));
