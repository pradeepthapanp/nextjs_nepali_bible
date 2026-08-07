/**
 * Barrel for the SHARED reader components (cross-feature — used by the Bible,
 * Articles and Devotions reading surfaces).
 *
 *   types.ts                      ReaderAlignment / ReaderTheme / READER_THEMES / ReaderSettingsContextValue
 *   reader-settings-provider.tsx  ReaderSettingsProvider (generic) + useReaderSettingsContext
 *   reader-toolbar.tsx            the compact reader control bar
 *   reader-settings-panel.tsx     the full reader settings surface
 */

export * from "./types";
export * from "./reader-settings-provider";
export * from "./reader-toolbar";
export * from "./reader-settings-panel";
