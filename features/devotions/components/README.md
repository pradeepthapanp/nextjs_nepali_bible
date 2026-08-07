# Devotions — components + page orchestration (implemented)

The Devotions components/pages are fully implemented. Everything reuses the
shared design system (`LoadingState`/`ErrorState`/`EmptyState`, `PageContainer`
+ the feature header convention) and the SHARED reader components
(`@components/reader` — the `ReaderToolbar`/`ReaderSettingsPanel`/`
ReaderSettingsProvider` promoted from Articles). The devotion route is PUBLIC —
**no `AuthGate`** (Flutter `/devotion` is in the Bible shell with no
`AuthStatePage` wrapper), and it is READ-ONLY (no admin actions).

## Reusable components (implemented)

| Component | Responsibility |
| --- | --- |
| `DevotionCard` | the "आजको वचन" card: `DEVOTION_HEADING` + the date row (`formatDevotionDate`) + divider + `DevotionContent` (the Flutter `TodaysDevotionPage` card) |
| `DevotionContent` | renders the SANITIZED devotion HTML (the SHARED `sanitizeHtml` from `@/utils/sanitize-html`) with the reader settings (font size / line height / paragraph spacing / alignment / family) and intercepts `B:` link taps → `onOpenReference` (the Flutter `Html(data, onLinkTap: _parseBibleLink)` port; the `ArticleContent` precedent — sanitized + reader-settings styled, with the `B:`-link handling) |
| `DevotionShareButton` | the AppBar share action (composes the page's `useDevotionShare`; the Flutter `shareFromSquare` IconButton) |
| `DevotionSuggestedReading` | the "Read Bible" + "Share" tiles (Flutter `_buildSuggestedReading` + `_buildRelatedVerseTile`); "Read Bible" → `openHome`, "Share" → the share action |
| `DevotionErrorState` | the error + "Try Again" (reuses the shared `ErrorState` with `onRetry` → `refetch`; the Flutter `_DevotionErrorWidget` port) |

## Page orchestrator (implemented)

| Page | Replaces (Flutter) | Route |
| --- | --- | --- |
| `TodaysDevotionPage` | `TodaysDevotionPage` | `/devotion` (PUBLIC) |

The page wraps everything in the SHARED `ReaderSettingsProvider` (value =
`useDevotionReaderSettings()`), composes `useDailyDevotion` (loading/error/empty
+ `refetch`), `useDevotionNavigation` (`goBack` + `openBibleReference` +
`openHome`), `useDevotionShare` (share), and renders the sticky header
(back button, title, `ReaderToolbar`, settings toggle → `ReaderSettingsPanel`,
`DevotionShareButton`) + the `DevotionCard` + `DevotionSuggestedReading`.
**Orchestration only** — no Supabase, no queries, no sanitization, no share
logic in the page.

`AppHeader`/`AppFooter` (site chrome, placeholder nav) are NOT used on feature
pages (consistent with Maps/Articles/Music/Songs/Community).

## Route shell (implemented)

`app/devotion/page.tsx` → a thin server shell rendering `<TodaysDevotionPage/>`.
Because there is exactly ONE devotion route, **no catch-all and no route
dispatcher are required** (unlike Maps/Articles/Music/Community).

## Editor (NOT required)

Devotions are read-only — Flutter has no create/edit UI and the `devotions`
table is admin-seeded. No `editor/` folder exists.

## Reuse (nothing duplicated)

- States: shared `LoadingState` / `ErrorState` / `EmptyState`.
- Layout: shared `PageContainer` + the feature-header convention.
- Reader: the SHARED `ReaderToolbar` / `ReaderSettingsPanel` /
  `ReaderSettingsProvider` (`@components/reader`) + the persisted devotion
  reader-settings store.
- HTML: the SHARED `sanitizeHtml` (`@/utils/sanitize-html`) + `readerFontStack`
  (`@/utils/fonts`) + the shared `.devotion-content` prose CSS (shares the
  `.article-content` rules in `globals.css`).
- Bible links: the EXISTING `buildBibleUrl` (via `useDevotionNavigation`).
- No `@features/articles` imports; no duplicated day-of-year / date / plain-text
  / deep-link logic (all in `utils/`).
