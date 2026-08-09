/**
 * Reader Settings — the single source of truth for the reading-surface
 * preferences.
 *
 * Mirrors the Flutter `Setting` model (`lib/models/settings.dart` +
 * `settings_notifier_provider.dart`) for everything the reading surface needs:
 * font size, line height, paragraph spacing, font family, alignment, the
 * display toggles (verse numbers / red letters / commentary / cross-refs) and
 * the reading theme (System / Light / Dark / Lamp sepia).
 *
 * The Zustand store (`store/reader-settings-store.ts`) holds the runtime state
 * + persistence; these constants are the shared defaults/ranges/lists so the
 * store, toolbar, shortcuts and surfaces all read one source (no duplication).
 */

/** Text alignment, mirroring the Flutter `FontAlignment` enum. */
export type ReaderAlignment = "left" | "center" | "right" | "justify";

/** Reading theme, mirroring the Flutter `AppThemeMode` enum. */
export type ReaderTheme = "system" | "light" | "dark" | "lamp";

/** The full reader settings snapshot (the store's persisted shape). */
export interface ReaderSettings {
  fontSize: number;
  lineHeight: number;
  paragraphSpacing: number;
  fontFamily: string;
  alignment: ReaderAlignment;
  theme: ReaderTheme;
  redLetters: boolean;
  showComments: boolean;
  showCrossReferences: boolean;
  showVerseNumbers: boolean;
  /** Selected commentary book id (defaults to the app default). */
  commentaryId: string;
  /** Show the English NIV parallel verse under each Nepali verse (default ON). */
  showEnglishVerses: boolean;
}

/** Font sizes (px) — stepper + keyboard shortcuts clamp to this range. */
export const READER_FONT_SIZE_DEFAULT = 17;
export const READER_FONT_SIZE_MIN = 12;
export const READER_FONT_SIZE_MAX = 30;

/** Line heights (em) — stepper + keyboard-friendly increments. */
export const READER_LINE_HEIGHT_DEFAULT = 1.8;
export const READER_LINE_HEIGHT_MIN = 1.0;
export const READER_LINE_HEIGHT_MAX = 2.5;
export const READER_LINE_HEIGHT_STEP = 0.1;

/** Paragraph spacing (px) — gap between paragraph blocks. */
export const READER_PARAGRAPH_SPACING_DEFAULT = 8;
export const READER_PARAGRAPH_SPACING_MIN = 0;
export const READER_PARAGRAPH_SPACING_MAX = 32;
export const READER_PARAGRAPH_SPACING_STEP = 2;

/**
 * Font families — SHARED (single source of truth in `@/utils/fonts`, used by
 * Bible, Songs and the future Article reader). Imported here and exposed under
 * the legacy `READER_*` names so the reader toolbar/store keep working
 * unchanged. These are const aliases (same references), not copies.
 */
import {
  APP_DEFAULT_FONT_FAMILY,
  APP_FONT_FAMILIES,
} from "@/utils/fonts";
import { DEFAULT_COMMENTARY } from "./defaults";

/** @deprecated Use `APP_FONT_FAMILIES` (shared `@/utils/fonts`). */
export const READER_FONT_FAMILIES = APP_FONT_FAMILIES;

/** @deprecated Use `APP_DEFAULT_FONT_FAMILY` (shared `@/utils/fonts`). */
export const READER_DEFAULT_FONT_FAMILY = APP_DEFAULT_FONT_FAMILY;

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

export const READER_SETTINGS_DEFAULTS: ReaderSettings = {
  fontSize: READER_FONT_SIZE_DEFAULT,
  lineHeight: READER_LINE_HEIGHT_DEFAULT,
  paragraphSpacing: READER_PARAGRAPH_SPACING_DEFAULT,
  fontFamily: READER_DEFAULT_FONT_FAMILY,
  alignment: "left",
  theme: "system",
  redLetters: true,
  showComments: true,
  showCrossReferences: true,
  showVerseNumbers: true,
  commentaryId: DEFAULT_COMMENTARY.id,
  showEnglishVerses: true,
};
