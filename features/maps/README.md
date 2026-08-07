# Maps feature (implemented)

Production-grade Next.js architecture for the Maps feature, derived from a full
study of the Flutter implementation (`lib/maps/*` + `lib/models/bible_map.dart`
+ `lib/providers/maps/*` + the `bible_maps` repository methods + the router).
Layers implemented bottom-up: architecture → data layer (`services/`) → React
Query layer (`queries/`) → stores/hooks/components → **pages + routes (this
phase)**. The feature is COMPLETE (see "Scope" below).

## Folder responsibilities

| Folder | Responsibility |
| --- | --- |
| `types/` | Domain contracts: `BibleMap`, `MapTopic`, `MapDeepLink`, `MapViewerState`. **Implemented.** |
| `constants/` | The viewer zoom tuning (`MAP_VIEWER_MIN/MAX_SCALE`, `DOUBLE_TAP_SCALE`). **Implemented.** |
| `queries/` | Cache-key hierarchy (`mapKeys`) + the query hooks (`useMapTopics`, `useMapsByTopic`, `useMap`). **Implemented.** |
| `services/` | `MapService`: `getTopics`, `getMapsByTopic`, web-first `getMapById` + `MapServices` factory + singleton. **Implemented.** |
| `utils/` | Pure helpers: `cleanMapTitle`, `filterMapsByQuery`, `buildMapUrl`, `parseMapPath`. **Implemented.** |
| `store/` | `useMapViewerStore` — the ONLY store (transient viewer zoom/pan/fullscreen; no server data; search is page-local hook state). **Implemented.** |
| `hooks/` | `useMapSearch`, `useMapViewer`, `useMapNavigation`. **Implemented.** |
| `components/` | `MapTopicList`, `MapTopicCard`, `MapList`, `MapCard`, `MapSearchBar`, `MapImageViewer`, `MapToolbar`, `MapInfoDialog`. **Implemented.** |
| `pages/` | `MapsTopicsPage`, `MapsListPage`, `MapViewerPage`, `MapRouteDispatcher`. **Implemented.** |
| `README.md` | This document — the full Flutter → Next mapping + decisions. |

## Full Flutter → Next mapping

### Pages

| Flutter page | Web page | Route | Key behavior |
| --- | --- | --- | --- |
| `BibleMapsView` (`maps_view.dart`) | `MapsTopicsPage` | `/maps` | "Maps & Charts" header; topics from `getBibleMapTopics`; tap → topic list |
| `MapsDetailView` (`maps_details_view.dart`) | `MapsListPage` | `/maps/topic/{topic}` | topic header + search field; `getMapsByTopic(topic)`; client-side title filter; "Showing X of Y" hint; tap → viewer |
| `BibleMapImageViewer` (`map_image_viewer.dart`) | `MapViewerPage` | `/maps/view/{id}` | full-screen black viewer; pan/zoom (double-tap 1↔2, wheel, pinch); info dialog + open-in-browser; error/retry; toolbar |

### Navigation flow

```mermaid
flowchart LR
    A["/maps<br/>(MapsTopicsPage)"] -->|"tap topic<br/>/maps/topic/{topic}"| B["MapsListPage"]
    B -->|"tap map<br/>/maps/view/{id}"| C["MapViewerPage"]
```

Flutter: `BibleMapsView` → `context.push('/maps/maps_details', extra: topic)` →
`MapsDetailView` → `Navigator.push(BibleMapImageViewer(bibleMap))` (no URL for
the viewer). Web: topic becomes a URL segment and the viewer becomes a URL
route — both deep-linkable, refresh-safe and back/forward friendly (the two
**web-first adaptations**).

### Models → types

| Flutter model | React type | Notes |
| --- | --- | --- |
| `BibleMap` (`bible_map.dart`) | `BibleMap` | id/topic/title/imageUrl/createdAt (camelCase of `image_url`/`created_at`) |
| topic `String` (RPC row `{ topic }`) | `MapTopic` | branded string alias — no separate table/model |
| `MapCategory` | — | **N/A**: the topic IS the grouping; there is no category table/model in Flutter |

### Repository → service

| Flutter repository method | Implemented service method |
| --- | --- |
| `getBibleMapTopics()` → `rpc('get_bible_map_topics')` | `getTopics()` |
| `getMapsByTopic(topic)` → `from('bible_maps').ilike('topic', …).order('created_at', asc)` | `getMapsByTopic(topic)` |
| — | `getMapById(id)` — **web-first** (viewer deep link; `.maybeSingle()` → null) |

### Providers / notifiers → queries + store

| Flutter provider | Implemented React Query hook | Planned Zustand store |
| --- | --- | --- |
| `mapsTopicsProvider` | `useMapTopics` (`mapKeys.topics`) | — |
| `mapListProvider(topic)` (autoDispose family) | `useMapsByTopic(topic)` (`mapKeys.byTopic`) | — |
| `_MapsDetailViewState` search controllers | — | `useMapSearchStore` (non-persisted) |
| `_BibleMapImageViewerState` (`TransformationController`) | — | — (transient `MapViewerState`, component-local) |

## Domain model contracts

- **`BibleMap`** — `{ id, topic, title, imageUrl, createdAt }`; `imageUrl` is an
  absolute media CDN URL (verified); titles carry a numeric prefix ("251. …").
- **`MapTopic`** — `string` (the 19 distinct topics returned by the RPC,
  verified live; e.g. "Net Bible Maps", "Cross, Heaven and Hell").
- **`MapDeepLink`** — `{kind:"topics"} | {kind:"list", topic} | {kind:"view", mapId}`.
- **`MapViewerState`** — `{ scale, imageStatus }` (transient, component-local).

## Intentional differences / web-first adaptations

1. **`extra: topic` → URL segment** — Flutter passes the topic in-memory; the
   web URL-encodes it into `/maps/topic/{topic}` (topics contain spaces/dashes/
   question marks) and decodes it on read.
2. **`Navigator.push` (viewer) → `/maps/view/{id}`** — the viewer becomes a
   deep-linkable route resolved by a web-first `getMapById`.
3. **`InteractiveViewer` → custom web pan/zoom** — no design-system equivalent;
   a small `MapImageViewer` (pointer events + CSS transform, `touch-action:
   none`, wheel + pinch + double-tap) with the `MAP_VIEWER_*` constants. No new
   dependency.
4. **`CachedNetworkImage` → `<img>` + shared states** — absolute CDN URLs +
   Loading/Error/Retry + "Open in Browser Instead" (`window.open`).
5. **Search is client-side** — Flutter filters loaded titles per keystroke; the
   web does the same (no debounce, no server query — the list is fully loaded).
6. **Read-only, no admin/CRUD, no pagination** — matches Flutter exactly (the
   RPC + the topic query return everything; there are no map mutations).

## Reuse (nothing duplicated)

- Shared design system: `LoadingState` / `ErrorState` / `EmptyState`, `Button`,
  `Card`, `SearchInput`, `Spinner`.
- Shared `useDialog` + `DialogPanel` (Music) for the viewer's info dialog.
- Shared `unwrap` (`@/services/helpers`), `createClient`
  (`@/lib/supabase/client`), `cn` (`@/utils/cn`).
- `getMapById` follows the established `useArticle(id)` / `useSong(id)` /
  `.maybeSingle()` pattern; `mapKeys` mirrors `musicKeys`/`articlesKeys`;
  `useMapSearchStore` mirrors `useArticleSearchStore`.

## Verify

- **No duplicated architecture**: every Flutter piece maps 1:1 to a planned
  web piece; the generic helpers (states, dialogs, search input, unwrap) are
  shared, not copied.
- **Reusable with the existing project**: same folder conventions, same
  bottom-up phase plan, same service/factory/keys/store/hook/component
  templates as Bible/Music/Articles.
- **No placeholder implementations**: nothing in this phase is a stub — the
  implemented files (`types`, `constants`, `query-keys`, barrel) are real
  contracts; everything else is a documented plan (README), not fake code.

## Scope (implemented)

Maps is COMPLETE: `types/`, `constants/`, `services/`, `queries/`, `utils/`,
`store/`, `hooks/`, `components/`, `pages/` + the `app/maps/[[...segments]]`
route. The feature reuses the shared design system (LoadingState / ErrorState /
EmptyState, SearchInput, Button, Card, `PageContainer`), the shared
`useDialog` lifecycle, `unwrap` and `createClient`. No backend tables/APIs are
invented (`bible_maps` + `get_bible_map_topics` exist and were verified).
`AppHeader`/`AppFooter` (site chrome with placeholder nav) are intentionally
NOT applied to feature pages, matching every other feature surface (they render
compact feature headers instead).

## Verify

- lint + build PASS; `get_errors` clean.
- Browser: `/maps` (19 real topics), `/maps/topic/{encoded}` deep link +
  client-side search ("Showing 3 of 21 results", empty "No results for …"),
  `/maps/view/{id}` viewer (zoom in/out 100→125→156%, double-click 1↔2, wheel
  zoom-to-cursor, drag-to-pan, pinch 40→120px=300%, reset/fit, fullscreen
  wiring + fresh-mount reset, info dialog), browser Back/Forward + refresh
  restore, 375px mobile no overflow.
- No direct Supabase in pages/hooks/components/store (grep clean — service +
  queries only), no cross-feature imports, single-source pure utils (no
  duplicated search/navigation/zoom logic).
