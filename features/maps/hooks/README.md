# Maps — behavior hooks (implemented)

The Maps behavior hooks are implemented (`use-map-search.ts`,
`use-map-viewer.ts`, `use-map-navigation.ts`). Each composes the existing
queries + stores + shared utilities — pages compose these hooks.

| Hook | Composes | Replaces |
| --- | --- | --- |
| `useMapSearch(topic)` | `useMapsByTopic` (React Query) + page-local `useState` query + the pure `filterMapsByQuery` | `__MapsDetailViewState._onSearchChanged` / `_filterTitles` |
| `useMapViewer(mapId?)` | `useMap` (React Query) + `useMapViewerStore` (zoom/pan/fullscreen) | `BibleMapImageViewer`'s data + `TransformationController` |
| `useMapNavigation()` | Next router + the pure `buildMapUrl` / `parseMapPath` | the Flutter `Navigator.push` / `context.push` flows |

## Contract notes (now satisfied)

- **`useMapSearch(topic)`** — CLIENT-SIDE only: the list is fully loaded, so
  the filter runs over the already-fetched array (faithful to Flutter's
  per-keystroke filter — no server query, NO `useDebouncedValue`). Returns
  `{ query, isSearching, setQuery, clear, maps, filteredMaps, isLoading,
  isError, error, refetch }`.
- **`useMapViewer(mapId?)`** — resolves the map by id (deep-link/refresh-safe)
  and exposes the transient viewer state + actions from `useMapViewerStore`.
  The gesture ENGINE (pointer/wheel/double-tap → store actions) lives in the
  `MapImageViewer` component; this hook only exposes the surface.
- **`useMapNavigation`** — `currentLink` (parsed deep link), `openTopics`,
  `openTopic(topic)` (`/maps/topic/{encoded}`), `openMap(id)`
  (`/maps/view/{id}`), `back`. The pure `buildMapUrl`/`parseMapPath` are
  exported from `utils/map-deep-link` for the route dispatcher.
