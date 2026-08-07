# Maps — data layer (implemented)

`map-service.ts` + `index.ts` are now REAL implementations (all `todo()`/contract
placeholders removed), following the Articles/Songs service conventions exactly.

## Flutter repository mapping

| Flutter repository method (`supabase_repository_provider.dart`) | Implemented service method | Backend | Notes |
| --- | --- | --- | --- |
| `getBibleMapTopics()` | `getTopics(): Promise<MapTopic[]>` | `client.rpc("get_bible_map_topics")` | The RPC returns `[{ topic: string }]` rows (VERIFIED live, 19 topics) — `mapTopic` extracts `row.topic`. No pagination. |
| `getMapsByTopic(topic)` | `getMapsByTopic(topic): Promise<BibleMap[]>` | `client.from("bible_maps").select().ilike("topic", topic).order("created_at", ascending: true)` | Faithful 1:1 (`.ilike` matches Flutter exactly; ascending created_at). Returns ALL maps for the topic (no limit/range — Flutter has none). |
| — | `getMapById(id): Promise<BibleMap \| null>` | `client.from("bible_maps").select().eq("id", id).maybeSingle()` | **WEB-FIRST** — Flutter pushes the whole `BibleMap` via `Navigator.push` (no fetch); the web needs `/maps/view/{id}` to be deep-link/refresh-safe, so it resolves by primary key. `.maybeSingle()` → `null` (like `getArticle`). |

## Aggregate + factory (implemented)

```ts
interface MapServices { map: MapService }

function createMapServices(client = createClient()): MapServices  // ONE shared client
function getMapServices(): MapServices                            // memoized singleton
```

Maps uses ONLY the `bible_maps` table + the `get_bible_map_topics` RPC — no
upload/profile services are needed (read-only public content, no auth gating,
no media uploads). `unwrap` comes from the shared `@/services/helpers`; the
client defaults to the shared `createClient()` (`@/lib/supabase/client`).

## Mappers (exported, like `mapArticle`/`mapSong`)

- `mapBibleMap(row)` — snake_case → camelCase (`image_url` → `imageUrl`,
  `created_at` → `createdAt`); the faithful port of `BibleMap.fromJson`.
- `mapTopic(row)` — `row.topic` (the RPC's `{ topic }` row → `MapTopic`).

## No invented backend

The `bible_maps` table and the `get_bible_map_topics` RPC **exist** in the
backend (verified at runtime). No tables or APIs are added — `getMapById` is a
plain primary-key query on the existing table.

