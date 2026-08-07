# Maps — React Query layer (implemented)

The cache-key hierarchy (`query-keys.ts`, `mapKeys`) AND the query hooks
(`use-maps.ts`) are now implemented. All queries go through the shared
`MapServices` (`getMapServices()`) — never Supabase directly. Maps is
**read-only** (no mutations): Flutter has no map create/update/delete, so there
are NO mutation hooks.

## Queries (implemented)

| Hook | Cache key | Flutter provider | Service method |
| --- | --- | --- | --- |
| `useMapTopics()` | `mapKeys.topics()` | `mapsTopicsProvider` | `getTopics()` |
| `useMapsByTopic(topic)` | `mapKeys.byTopic(topic)` | `mapListProvider(topic)` (autoDispose family) | `getMapsByTopic(topic)` |
| `useMap(mapId?)` | `mapKeys.detail(mapId)` | — (web-first; Flutter pushes the object) | `getMapById(id)` (web-first) |

### Contract notes (now satisfied)

- **`useMapTopics`** — `useQuery({ queryKey: mapKeys.topics(), queryFn: … })`.
  No pagination (the RPC returns every distinct topic; Flutter renders them all).
- **`useMapsByTopic(topic)`** — `useQuery` gated `enabled: Boolean(topic)` (the
  deep-link topic is URL-decoded on the page and passed in). Ordered by
  `created_at` ascending inside the service (faithful — Flutter sorts there).
- **`useMap(mapId?)`** — WEB-FIRST single-map lookup for `/maps/view/{id}`,
  gated `enabled: Boolean(mapId)`, returns `BibleMap | null` via `.maybeSingle()`.
  Analogous to `useArticle(id)` / `useSong(id)`.
- No `placeholderData`/infinite scroll: both queries are single-shot finite
  lists (the RPC and the `bible_maps` query have no pagination in Flutter, so
  none is invented on the web).

## No mutations

Flutter's Maps surface is entirely read-only (topics → list → viewer). There
are no repository create/update/delete methods and no admin surface, so no
`useMapMutations` exist — CRUD was not invented.

