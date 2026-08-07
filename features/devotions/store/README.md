# Devotions — store (implemented, ONE justified store)

The Devotions store layer is fully implemented with exactly ONE store.

## `useDevotionReaderSettingsStore` (the only store)

Holds `{ fontSize, lineHeight, paragraphSpacing, fontFamily, alignment, theme }`
(+ clamped setters + `reset`), persisted to localStorage (`devotions.reader-settings`).

**Why it is justified** — the devotion renders its HTML body with
reader-appearance preferences exactly like the Bible and Article readers, and
the web convention is a PER-FEATURE persisted reader-settings store:

- Flutter reads the ONE global `settingsProvider` (`TodaysDevotionPage`:
  `settings.fontSize`, `.fontAlignment`, `.lineHeight`), persisted to
  `SharedPreferences` (`settings_v2`).
- The web splits this per-feature because **features must not import from
  `@features/*`** (Bible: `bible.reader-settings`; Articles:
  `articles.reader-settings`) — so Devotions keeps its own store, with the
  Flutter-faithful defaults (`DEVOTION_READER_SETTINGS_DEFAULTS`: fontSize 21,
  lineHeight 1.2, paragraphSpacing 8, alignment left, theme system, family
  `Noto Sans Devanagari`).
- The store's shape IS the SHARED `ReaderSettingsContextValue`
  (`@components/reader`), so the SHARED `ReaderToolbar` / `ReaderSettingsPanel` /
  `ReaderSettingsProvider` work for the devotion with NO changes.
- Setters clamp to the shared ranges in `constants/reader-settings.ts`
  (no per-caller clamping — the toolbar/settings-panel convention).

## Explicitly NO other stores

- **NO session store** — the `SupabaseProvider` owns the session (the one auth
  source).
- **NO devotion cache store** — React Query owns the server state
  (`devotionKeys.daily`).
- **NO share/composer store** — the share button is a one-shot action
  (transient local state in `useDevotionShare`), the auth-forms precedent.
