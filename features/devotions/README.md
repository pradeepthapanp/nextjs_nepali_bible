# Devotions feature (complete — Today's Devotion)

Production-grade Next.js implementation of the Devotions feature, derived from a
full study of the Flutter implementation (`lib/devotions/todays_devotion_page.dart`;
`lib/providers/devotion/local_devotion_provider.dart`; the `getDevotionSingle`
repository method in `lib/providers/supabase/supabase_repository_provider.dart`;
the `lib/models/devotion.dart` model; the `/devotion` route in
`lib/router/app_router.dart` + `lib/router/app_routes.dart`) AND the live
Supabase schema (verified — see below).

**Implemented (complete feature)**: `types/`, `constants/`, `queries/`
(`devotionKeys` + `useDailyDevotion`), `utils/` (the pure helpers), `services/`
(`DevotionService` + the aggregate), `store/` (`useDevotionReaderSettingsStore`),
`hooks/` (`useDevotionReaderSettings` / `useDevotionNavigation` /
`useDevotionShare`), `components/` (the reusable components + the
`TodaysDevotionPage`) and the `/devotion` route shell. The shared `sanitizeHtml`
and the `ReaderToolbar`/`ReaderSettingsPanel`/`ReaderSettingsProvider` were
PROMOTED to `@/utils` / `@components/reader` (the `timeAgo` pattern) so
Articles and Devotions share ONE implementation. See the folder READMEs for
the per-layer details.

## Feature overview

Devotions is the **smallest, read-only** feature: a single public page
(`/devotion`) that shows **today's devotion** — one HTML row from the
`devotions` table (`day` = day-of-year), rendered with the user's reading
preferences and shareable. There is no list, no detail-by-id, no create/edit
UI, no auth, no admin actions, no uploads, no images.

## Flutter → Web mapping

| Flutter piece | Web piece | Notes |
| --- | --- | --- |
| `Devotion` model (`lib/models/devotion.dart`) | `types/devotion.ts` `Devotion` | `id`, `day`, `devotion` (HTML), `createdAt` |
| `SupabaseRepository.getDevotionSingle()` | `DevotionService.getDailyDevotion()` | day-of-year → `devotions` `.eq('day', today).maybeSingle()` (**WEB ADAPTATION**: `.single()` → throws/error in Flutter; `.maybeSingle()` → null so the page can show the EmptyState) |
| `dailyDevotionProvider` (`local_devotion_provider.dart`) | `useDailyDevotion` query | the only server state |
| `settingsProvider` (fontSize / fontAlignment / lineHeight) | `useDevotionReaderSettingsStore` + `useDevotionReaderSettings` | per-feature reader-settings store (see `store/README.md`); the SHARED `@components/reader` toolbar/panel/context consume it |
| `TodaysDevotionPage` (`/devotion`) | `TodaysDevotionPage` (`/devotion`) | the single page |
| `Html(data: devotion.devotion, onLinkTap: _parseBibleLink)` | `DevotionContent` | sanitized HTML (SHARED `sanitizeHtml`) + reader settings + `B:` link taps |
| `ReferenceVersesSheet` (on `B:` link) | `useDevotionNavigation.openBibleReference` | **web adaptation**: bottom sheet → navigate to the passage via the EXISTING `buildBibleUrl` (the Bible `goTo` precedent) |
| `_buildSuggestedReading` + `_buildRelatedVerseTile` | `DevotionSuggestedReading` | "Read Bible" + "Share" tiles |
| `_DevotionErrorWidget` (error + Try Again) | `DevotionErrorState` | reuses the shared `ErrorState` + `refetch` |
| `ShareCopy.shareHtmlContent` | `useDevotionShare` | `navigator.share` + `copyTextToClipboard` fallback (the Bible `shareAction` pattern) |
| `_shareDevotional` (`'Daily Devotional -' + date`) | `DEVOTION_SHARE_TITLE_PREFIX` + `formatDevotionDate` | the share title |
| `RefreshIndicator` → `ref.invalidate(dailyDevotionProvider)` | `useDailyDevotion().refetch()` | the pull-to-refresh / retry entry point |

## Routes

| Route | Page | Protected? |
| --- | --- | --- |
| `/devotion` | `TodaysDevotionPage` | **PUBLIC** (Flutter `/devotion` has no `AuthStatePage` wrapper — it lives in the Bible shell) |

A single `app/devotion/page.tsx` server shell mounts the page. **No catch-all
and no route dispatcher** — there is exactly one devotion route.

## Deep links

- **Model** (`types/deep-link.ts`): `DevotionDeepLink` = `{ kind: "devotion" }`
  (the single target) + `DevotionBibleReference` = `{ bookNumber, chapter,
  verse }` (the parsed `B:` link target).
- **URL source** (`utils/deep-link.ts`): `buildDevotionUrl` → `/devotion`;
  `parseDevotionPath` → `{ kind: "devotion" }` when `/devotion`, else null.
- **Bible links** (`utils/bible-link.ts`): `parseDevotionBibleLink(link)` —
  the Flutter `_parseBibleLink` regex (`^B:(\d+)\s+(\d+):(\d+)(?:-\d+)?$`)
  — the devotion-specific PARSER. The URL is built by the EXISTING
  `buildBibleUrl` (`@features/bible/utils/deep-link`, reused by
  `useDevotionNavigation`) — the user-sanctioned reuse (the Community
  `AuthGate` precedent) — so NO bible URL logic is duplicated.

## Permissions

**None.** The devotion is public (Flutter `/devotion` is not auth-wrapped) and
read-only (no create/edit/delete, no admin actions). No `AuthGate`, no
`canManage`, no permission helpers. The `devotions` table is publicly readable
(verified live).

## Reusable components

See `components/README.md` (implemented): `TodaysDevotionPage`, `DevotionCard`,
`DevotionContent`, `DevotionShareButton`, `DevotionSuggestedReading`,
`DevotionErrorState` — reusing the shared `LoadingState` / `ErrorState` /
`EmptyState`, `PageContainer` + the feature-header convention, the SHARED
`ReaderToolbar`/`ReaderSettingsPanel`/`ReaderSettingsProvider`
(`@components/reader`) and the shared `@/utils/fonts`.

## Service contracts

See `services/README.md` (implemented): `DevotionService.getDailyDevotion()`
(day-of-year → `.eq("day", day).maybeSingle()` → `mapDevotion` → `Devotion |
null`), the `DevotionServices { devotion }` aggregate + `createDevotionServices(
client = createClient())` (ONE shared client) + the memoized
`getDevotionServices()`. Mappers (`mapDevotion`, `DevotionRow`) follow the
`map*` convention. Read-only.

## Editor

**NOT required.** Devotions have no create/edit UI in Flutter and the
`devotions` table is admin-seeded — no `editor/` folder is created.

## Backend schema (VERIFIED against the live Supabase backend)

A runtime probe (deleted) confirmed the `devotions` table exists and is
publicly readable with EXACTLY the Flutter `Devotion` model columns (PostgREST
rejects unknown columns — the full select passed):

- `devotions`: `id`, `day`, `devotion` (HTML body), `created_at`.

The probe also confirmed today's devotion resolves by day-of-year
(`day = 219` on 2026-08-07 → 1 row, HTML body ~2.7KB). All devotion
operations are a single plain table query — **NO RPCs, no new tables, no
invented backend APIs**.

## Shared infra (promoted this phase)

The `DevotionContent` + `useDevotionShare` needed the project's single HTML
sanitizer → `sanitizeHtml` was **promoted to `@/utils/sanitize-html.ts`** (the
`timeAgo` precedent; Articles re-exports it). The SHARED `ReaderToolbar` /
`ReaderSettingsPanel` / `ReaderSettingsProvider` + the `READER_THEMES` /
`ReaderTheme` / `ReaderAlignment` types were **promoted to `@components/reader`**
(Articles re-exports them; its `ARTICLE_READER_THEMES` aliases the shared list).
The generic `.devotion-content` prose CSS shares the `.article-content` rules in
`globals.css`.

## Folder layout

| Folder | Status |
| --- | --- |
| `types/` | IMPLEMENTED — `Devotion`, `DevotionDeepLink`, `DevotionBibleReference` |
| `constants/` | IMPLEMENTED — titles/heading/share + the reader-settings defaults/ranges |
| `utils/` | IMPLEMENTED — `getDayOfYear`, `formatDevotionDate`, `parseDevotionBibleLink`, `buildDevotionUrl`/`parseDevotionPath`, `devotionToPlainText` |
| `queries/` | IMPLEMENTED — `devotionKeys` + `useDailyDevotion` |
| `services/` | IMPLEMENTED — `DevotionService` + the `DevotionServices` aggregate/factory/singleton |
| `store/` | IMPLEMENTED — ONE justified store: `useDevotionReaderSettingsStore` (persisted) |
| `hooks/` | IMPLEMENTED — `useDevotionReaderSettings` / `useDevotionNavigation` / `useDevotionShare` |
| `components/` | IMPLEMENTED — the page + the reusable components |
| `editor/` | NOT required (read-only, admin-seeded) |
| `README.md` | this file (the whole-feature doc) |
