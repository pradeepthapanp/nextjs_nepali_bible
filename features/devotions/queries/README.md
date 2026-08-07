# Devotions — React Query layer (implemented)

The Devotions query layer is fully implemented. `features/devotions/queries/`
holds the cache-key hierarchy + the single query hook (read-only feature: no
mutations).

## Cache-key hierarchy (`query-keys.ts`)

`devotionKeys.all` (`["devotions"]`) is the feature prefix; `devotionKeys.daily`
(`["devotions", "daily"]`) is today's devotion. The devotion is a single public
read — no list / detail-by-id / per-user keys (the SESSION is not a key — the
`SupabaseProvider` owns it).

## Query hook (implemented)

| Hook | Cache key | Contract |
| --- | --- | --- |
| `useDailyDevotion()` | `devotionKeys.daily` | `useQuery({ queryKey: devotionKeys.daily, queryFn: () => getDevotionServices().devotion.getDailyDevotion() })`. **PUBLIC — NO enabled guard and NO session dependency** (Flutter's `dailyDevotionProvider` is a plain `FutureProvider`, no auth). Returns `Devotion \| null`: loading → `isLoading`; no devotion today → `data === null` (EmptyState); error → `isError` (ErrorState + retry). |

## Mutations

**NONE.** Devotions are read-only (Flutter has no create/edit/delete UI — the
`devotions` table is admin-seeded). No mutation hooks exist.

## Refresh / caching strategy

- `refetch()` is wired to the Flutter `RefreshIndicator`
  (`ref.invalidate(dailyDevotionProvider)`) and the error state's "Try Again"
  (`_DevotionErrorWidget` → `ref.invalidate`). Both surfaces call the same
  `useDailyDevotion().refetch()`.
- No special `staleTime` — the devotion changes at most once per day and React
  Query refetches on window focus by default (faithful enough).

## Reuse (nothing duplicated)

- The service call goes through `getDevotionServices()` (the memoized
  `DevotionServices` singleton).
- No `@features/*` imports (except the sanctioned `buildBibleUrl` navigation
  helper in the navigation hook); no direct `supabase`.
