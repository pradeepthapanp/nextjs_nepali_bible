# Devotions — behavior hooks (implemented)

The Devotions hooks are fully implemented. Every hook composes the existing
React Query hook + the pure utils + the reader-settings store + the SHARED
infra (`@/utils/clipboard`, `@/utils/fonts`, the shared `@components/reader`)
and the EXISTING Bible deep-link helper — **never Supabase directly, no
duplicated business logic**.

## Hooks (implemented)

| Hook | Composes | Contract |
| --- | --- | --- |
| `useDevotionReaderSettings()` | `useDevotionReaderSettingsStore` | exposes the persisted reader prefs + clamped setters + `reset` (the `useArticleReaderSettings` wrapper pattern). The return shape is the SHARED `ReaderSettingsContextValue`, so the page hands it straight to the shared `ReaderSettingsProvider` and the shared `ReaderToolbar`/`ReaderSettingsPanel` consume it unchanged |
| `useDevotionNavigation()` | `useRouter`/`usePathname` + the pure `parseDevotionPath` + the EXISTING `buildBibleUrl` (`@features/bible/utils/deep-link`) | `{ currentLink, openBibleReference, goBack, openHome }` — `openBibleReference(reference)` → `router.push(buildBibleUrl({kind:"verse", ...}))`; `goBack` → history back else `/`; `openHome` → `/` (the "Read Bible" tile, Flutter `context.go(AppRoutes.home)`). **REUSES the existing Bible deep-link helper** (the user-sanctioned cross-feature reuse, the Community `AuthGate` precedent) — no bible URL logic duplicated |
| `useDevotionShare()` | `navigator.share` + the shared `copyTextToClipboard` (`@/utils/clipboard`) + the pure `devotionToPlainText` | `{ share, isSharing }` — ports `ShareCopy.shareHtmlContent`: extract plain text → `navigator.share({ text, title })` with the `copyTextToClipboard` fallback (the Bible `shareAction` pattern). Title = `DEVOTION_SHARE_TITLE_PREFIX + formatDevotionDate()` |

## Reuse (nothing duplicated)

- Query: `useDailyDevotion` (the React Query hook) → `getDevotionServices()`.
- Share: `navigator.share` + the shared `copyTextToClipboard` (the Bible
  `shareAction` established this) — NO new clipboard helper.
- Fonts: `readerFontStack` (`@/utils/fonts`) for the devotion body font.
- Bible links: the EXISTING `buildBibleUrl` from `@features/bible/utils/deep-link`
  (the user-sanctioned reuse); the devotion-specific `parseDevotionBibleLink`
  (the Flutter `_parseBibleLink` regex) stays in `utils/`.
- No direct Supabase; no duplicated day-of-year / date / plain-text / deep-link
  logic (all in `utils/`).
