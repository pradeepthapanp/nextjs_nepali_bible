# Maps — utils (implemented)

The Maps pure helpers are implemented (framework-free, directly unit-testable):

| Helper | Flutter port | Responsibility |
| --- | --- | --- |
| `cleanMapTitle(title)` | `_cleanTitle` (both `maps_details_view.dart` + `map_image_viewer.dart`) | strips the leading numeric prefix — `replace(/^\d+\.?\s*/, "")` ("251. The Church #1" → "The Church #1") |
| `filterMapsByQuery(maps, query)` | `_filterTitles` (`maps_details_view.dart`) | client-side title filter on the RAW title (empty query → all) |
| `buildMapUrl(link: MapDeepLink)` | `context.push('${AppRoutes.maps}/${AppRoutes.mapDetails}')` + `Navigator.push` | `/maps`, `/maps/topic/{encodeURIComponent(topic)}`, `/maps/view/{id}` — the single place Maps URLs are built |
| `parseMapPath(pathname)` | — | parses `/maps`, `/maps/topic/{topic}` (decoded), `/maps/view/{id}` → `MapDeepLink \| null` — the ONLY place Maps URLs are parsed (used by `useMapNavigation` + the dispatcher) |

## Reuse (nothing duplicated)

- The shared `@/utils/cn`, `@/components/ui/*` states, and the shared
  `useDialog` lifecycle are reused by the components — no copies here.
- **`mediaPathFromUrl` / `MEDIA_BASE_URL` (`@/utils/media`) are NOT needed**:
  `bible_maps.image_url` stores absolute media CDN URLs (verified) and Maps is
  read-only (no uploads/deletes).
- **No `useDebouncedValue`** — the map search is a pure client-side filter over
  already-loaded data.
- **No `slugify`** — topics are displayed verbatim (URL-encoded), not slugged
  (faithful — Flutter shows the raw topic string).
