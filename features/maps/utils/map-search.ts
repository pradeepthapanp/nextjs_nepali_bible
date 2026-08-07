import type { BibleMap } from "../types";

/**
 * filterMapsByQuery — the client-side map-title filter (the faithful port of
 * Flutter's `_filterTitles` in `maps_details_view.dart`):
 * `maps.where((map) => map.title.toLowerCase().contains(_searchQuery))`.
 *
 * Search stays CLIENT-SIDE exactly like Flutter — no server search. The query
 * is trimmed + lowercased; an empty query returns the list unchanged. Matching
 * is on the RAW `map.title` (Flutter filters the raw title; `cleanMapTitle`
 * is only for DISPLAY).
 */
export function filterMapsByQuery(
  maps: BibleMap[],
  query: string,
): BibleMap[] {
  const q = query.trim().toLowerCase();
  if (!q) return maps;
  return maps.filter((map) => map.title.toLowerCase().includes(q));
}
