"use client";

import { useMemo, useState } from "react";
import { useMapsByTopic } from "../queries";
import type { MapTopic } from "../types";
import { filterMapsByQuery } from "../utils";

/**
 * useMapSearch — the maps-list search behavior (the web equivalent of
 * `__MapsDetailViewState._searchController` / `_searchQuery` /
 * `_filterTitles` in `maps_details_view.dart`).
 *
 * COMPOSES the existing `useMapsByTopic(topic)` React Query hook and applies
 * the pure CLIENT-SIDE title filter (`filterMapsByQuery` — a faithful port of
 * Flutter's `_filterTitles`). Search is page-local `useState` (exactly like
 * Flutter's local `TextEditingController`) — no store, no server search, no
 * debounce (the list is fully loaded).
 */
export function useMapSearch(topic?: MapTopic) {
  const mapsQuery = useMapsByTopic(topic);
  const [query, setQuery] = useState("");

  const maps = useMemo(() => mapsQuery.data ?? [], [mapsQuery.data]);

  const filteredMaps = useMemo(
    () => filterMapsByQuery(maps, query),
    [maps, query],
  );

  return {
    // Search input state (page-local, like Flutter).
    query,
    isSearching: query.trim().length > 0,
    setQuery,
    clear: () => setQuery(""),
    // The maps list (loaded via React Query) + the filtered view.
    maps,
    filteredMaps,
    // Query surface.
    isLoading: mapsQuery.isLoading,
    isError: mapsQuery.isError,
    error: mapsQuery.error,
    refetch: () => void mapsQuery.refetch(),
  };
}
