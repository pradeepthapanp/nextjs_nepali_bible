# Devotions — services data layer (implemented)

The Devotions data layer is fully implemented. `features/devotions/services/`
holds `DevotionService` + the aggregate + the factory/singleton.

## Flutter repository → service mapping

| Flutter repository method | Web service method | Notes |
| --- | --- | --- |
| `SupabaseRepository.getDevotionSingle()` | `DevotionService.getDailyDevotion()` | `getDayOfYear(new Date())` → `devotions` `.eq("day", day).maybeSingle()` → `mapDevotion` |

## Service contract (implemented)

### `DevotionService` (the `devotions` table — READ-ONLY)

- `getDailyDevotion(): Promise<Devotion | null>` — computes today's day-of-year
  via the pure `getDayOfYear` util, selects `devotions` `.eq("day", day)`
  `.maybeSingle()`, unwraps with the SHARED `unwrap` (`@/services/helpers`) and
  maps to `Devotion`. **WEB ADAPTATION**: Flutter uses `.single()` (throws when
  no row exists → ERROR state); the web uses `.maybeSingle()` → `null` so the
  page can distinguish "no devotion today" (EmptyState) from a real error. Uses
  the shared `createClient` (`@/lib/supabase/client`, `@supabase/ssr`).
- Mapper `mapDevotion` + `DevotionRow` exported (the `map*` convention).
- **NO other methods**: no list, no create/edit/delete (read-only, admin-seeded).

### Aggregate + singleton (the factory convention)

- `DevotionServices { devotion }` — one aggregate exposing the service.
- `createDevotionServices(client = createClient())` — ONE shared `@supabase/ssr`
  browser client (devotion is the only consumer).
- `getDevotionServices()` — the memoized singleton.

No session, profile or upload service is needed (public, read-only, no
author/image columns).

## Backend schema (VERIFIED against the live Supabase backend)

A runtime probe confirmed the `devotions` table exists and is publicly readable
with EXACTLY the Flutter `Devotion` model columns (PostgREST rejects unknown
columns — the full select passed):

- `devotions`: `id`, `day`, `devotion` (HTML body), `created_at`.

`Devotion` maps `day` → `Devotion.day` (int), `devotion` → `Devotion.devotion`
(string, HTML), `created_at` → `Devotion.createdAt` (ISO string).

**No RPCs, no new tables, no invented backend APIs** — a single plain table
query, exactly like Flutter.
