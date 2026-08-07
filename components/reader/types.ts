/**
 * Shared reader-settings types + theme options for the reading surfaces
 * (Bible, Articles, Devotions). PROMOTED so the shared `ReaderToolbar` /
 * `ReaderSettingsPanel` / `ReaderSettingsProvider` are feature-agnostic
 * (features must not import from `@features/*`).
 */

/** Reader text alignment — the Flutter `FontAlignment` enum (shared). */
export type ReaderAlignment = "left" | "center" | "right" | "justify";

/** Reader reading theme — the Flutter `AppThemeMode` enum (shared). */
export type ReaderTheme = "system" | "light" | "dark" | "lamp";

/** Reading theme options (value + label + description), from `AppThemeModeX`. */
export const READER_THEMES: {
  value: ReaderTheme;
  label: string;
  description: string;
}[] = [
  { value: "system", label: "System", description: "Follow your device appearance" },
  { value: "light", label: "Light Mode", description: "Bright theme for daytime use" },
  { value: "dark", label: "Dark Mode", description: "Dark theme for low-light environments" },
  { value: "lamp", label: "Reading Mode", description: "Warm sepia theme for comfortable reading" },
];

/**
 * The reader-settings CONTEXT value — the shared shape every reading surface
 * provides (font size / line height / paragraph spacing / font family /
 * alignment / theme + clamped setters + reset). The Articles and Devotions
 * reader-settings stores are structurally compatible (their wrapper hooks
 * return this shape), so the shared `ReaderSettingsProvider` +
 * `ReaderToolbar`/`ReaderSettingsPanel` work for both with no changes.
 */
export interface ReaderSettingsContextValue {
  fontSize: number;
  lineHeight: number;
  paragraphSpacing: number;
  fontFamily: string;
  alignment: ReaderAlignment;
  theme: ReaderTheme;
  setFontSize: (value: number) => void;
  setLineHeight: (value: number) => void;
  setParagraphSpacing: (value: number) => void;
  setFontFamily: (value: string) => void;
  setAlignment: (alignment: ReaderAlignment) => void;
  setTheme: (theme: ReaderTheme) => void;
  reset: () => void;
}
