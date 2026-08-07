/**
 * Devotion reader settings — the reading-surface preferences for the devotion
 * HTML (font size, line height, paragraph spacing, font family, alignment,
 * theme).
 *
 * The Flutter devotion page reads the SAME global `settingsProvider` the Bible
 * reader uses (`TodaysDevotionPage`: `settings?.fontSize`, `.fontAlignment`,
 * `.lineHeight`, with `Setting.initial` defaults fontSize 21, lineHeight 1.2,
 * alignment left, font 'Noto Sans Devanagari'). The web convention is a
 * PER-FEATURE persisted reader-settings store (Bible `bible.reader-settings`,
 * Articles `articles.reader-settings`), because features must not import from
 * `@features/*` — so Devotions gets its own store + these constants. The
 * DEFAULT VALUES stay faithful to the Flutter `Setting.initial` used by the
 * devotion page; the RANGES mirror the web reader surfaces (`@/utils/fonts` +
 * the Bible reader's documented 12–30px / 1.0–2.5em ranges). The alignment /
 * theme TYPES + the theme list are the SHARED `@components/reader` types
 * (no duplication — the shared `ReaderToolbar`/`ReaderSettingsPanel` consume
 * them).
 */

import { type ReaderAlignment, type ReaderTheme } from "@/components/reader";

/** Text alignment — the SHARED `ReaderAlignment` (Flutter `FontAlignment`). */
export type DevotionAlignment = ReaderAlignment;

/** Reading theme — the SHARED `ReaderTheme` (Flutter `AppThemeMode`). */
export type DevotionTheme = ReaderTheme;

/** The full devotion reader settings snapshot (the store's persisted shape). */
export interface DevotionReaderSettings {
  fontSize: number;
  lineHeight: number;
  paragraphSpacing: number;
  fontFamily: string;
  alignment: DevotionAlignment;
  theme: DevotionTheme;
}

/** Font sizes (px) — defaults from Flutter `Setting.initial.fontSize = 21`. */
export const DEVOTION_FONT_SIZE_DEFAULT = 21;
export const DEVOTION_FONT_SIZE_MIN = 12;
export const DEVOTION_FONT_SIZE_MAX = 30;

/** Line heights (em) — default from Flutter `Setting.initial.lineHeight = 1.2`. */
export const DEVOTION_LINE_HEIGHT_DEFAULT = 1.2;
export const DEVOTION_LINE_HEIGHT_MIN = 1.0;
export const DEVOTION_LINE_HEIGHT_MAX = 2.5;
export const DEVOTION_LINE_HEIGHT_STEP = 0.1;

/** Paragraph spacing (px) — gap between paragraphs (web reader convention). */
export const DEVOTION_PARAGRAPH_SPACING_DEFAULT = 8;
export const DEVOTION_PARAGRAPH_SPACING_MIN = 0;
export const DEVOTION_PARAGRAPH_SPACING_MAX = 32;
export const DEVOTION_PARAGRAPH_SPACING_STEP = 2;

/** The default alignment (Flutter `Setting.initial.fontAlignment = left`). */
export const DEVOTION_ALIGNMENT_DEFAULT: DevotionAlignment = "left";

/** The default theme (Flutter `Setting.initial.themeMode = system`). */
export const DEVOTION_THEME_DEFAULT: DevotionTheme = "system";

/** The default font family — the SHARED default (`@/utils/fonts`,
 * 'Noto Sans Devanagari', loaded by next/font in the root layout). */
import { APP_DEFAULT_FONT_FAMILY } from "@/utils/fonts";
export { APP_DEFAULT_FONT_FAMILY as DEVOTION_DEFAULT_FONT_FAMILY };

/** The full defaults snapshot the store initializes from. */
export const DEVOTION_READER_SETTINGS_DEFAULTS: DevotionReaderSettings = {
  fontSize: DEVOTION_FONT_SIZE_DEFAULT,
  lineHeight: DEVOTION_LINE_HEIGHT_DEFAULT,
  paragraphSpacing: DEVOTION_PARAGRAPH_SPACING_DEFAULT,
  fontFamily: APP_DEFAULT_FONT_FAMILY,
  alignment: DEVOTION_ALIGNMENT_DEFAULT,
  theme: DEVOTION_THEME_DEFAULT,
};
