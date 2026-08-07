# Maps — components + pages (implemented)

The Maps components (`components/`) and pages (`pages/`) are implemented. All
components reuse the shared design system (`@/components/ui`: Button, Card,
SearchInput, LoadingState, ErrorState, EmptyState) + `cn` + the shared
`useDialog` lifecycle; pages reuse `PageContainer` and compose the behavior
hooks (they never query Supabase, duplicate search/navigation/zoom/image logic).

## Components (implemented)

| Flutter widget | Component | Responsibility |
| --- | --- | --- |
| `ListView.builder` of `ListTile`s in `BibleMapsView` | `MapTopicList` + `MapTopicCard` | the topics list (centered titles, 2-line ellipsis) + states; presentational `{ topics, onOpen }` |
| `_filterTitles` + `ListView` of `ListTile`s in `MapsDetailView` | `MapList` + `MapCard` | the maps list (image icon, `cleanMapTitle`, chevron) + states + "Showing X of Y" hint; presentational (maps are ALREADY filtered by the caller) |
| the `TextField` in `MapsDetailView` | `MapSearchBar` | wraps the SHARED `SearchInput`; presentational `{ value, onValueChange, onClear, placeholder }` — no search logic |
| `BibleMapImageViewer` body | `MapImageViewer` | the CUSTOM pan/zoom engine (no third-party lib): wheel zoom-to-cursor (native passive:false), drag-to-pan (pointer events + capture), pinch (two-pointer), double-click/double-tap 1↔2, keyboard +/-/0/f, image loading/error/retry + "Open in Browser Instead"; composes `useMapViewerStore` |
| — (web refinement) | `MapToolbar` | zoom in/out, % readout, fit-to-screen, reset, fullscreen toggle — composes `useMapViewerStore` directly (in sync with the image) |
| `_showInfoDialog` AlertDialog | `MapInfoDialog` | image info + "Open in Browser" (`window.open`) + Close — shared `useDialog` + framer-motion (the Music dialog pattern) |

## Pages (implemented — `pages/`, route-level orchestration only)

| Page | Replaces (Flutter) | Route | Composes |
| --- | --- | --- | --- |
| `MapsTopicsPage` | `BibleMapsView` | `/maps` | `useMapTopics` + `useMapNavigation.openTopic` → `MapTopicList` + `PageContainer` |
| `MapsListPage` | `MapsDetailView` | `/maps/topic/{topic}` | `useMapSearch(topic)` (query + client-side filter) + `useMapNavigation.openMap/back` → `MapSearchBar` + `MapList` |
| `MapViewerPage` | `BibleMapImageViewer` | `/maps/view/{id}` | `useMapViewer(mapId)` + `useMapNavigation.back` → black full-screen shell + `MapImageViewer` + `MapToolbar` + `MapInfoDialog`; OWNS the DOM fullscreen effect + resets the viewer store on mount |
| `MapRouteDispatcher` | the `Navigator.push` flow | mounted by `app/maps/[[...segments]]/page.tsx` | routes via `parseMapPath` (topics → list → view), passing topic/mapId to the pages |

## Web-first behavior that cannot be ported exactly

1. **`extra: topic` → URL segment** — topic URL-encoded in `/maps/topic/…`
   (real topics contain spaces/dashes/question marks) and decoded on read.
2. **`Navigator.push(BibleMapImageViewer)` → `/maps/view/{id}`** — the viewer
   is a deep-link route resolved by id (web-first `getMapById`).
3. **`InteractiveViewer` → custom `MapImageViewer`** — pointer events + CSS
   transform (center-origin), `touch-action: none` for mobile pinch, wheel
   zoom-to-cursor, boundary-clamped pan, `MAP_VIEWER_*` constants; no new npm
   dependency.
4. **`CachedNetworkImage` → `<img>` + shared states** — absolute CDN URLs +
   loading/error/retry + "Open in Browser Instead" (`window.open`).
5. **Fullscreen** — `requestFullscreen` on the page container (header +
   toolbar stay visible); requires a user gesture in real browsers (verified
   via a mocked call in headless).
6. **Search stays client-side** exactly like Flutter (no debounce/server query).
