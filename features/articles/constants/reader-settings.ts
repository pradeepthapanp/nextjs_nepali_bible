import {
  READER_THEMES,
  type ReaderAlignment,
  type ReaderTheme,
} from "@/components/reader";
import {
  APP_DEFAULT_FONT_FAMILY,
  APP_FONT_FAMILIES,
} from "@/utils/fonts";

/**
 * Article Reader Settings — the reading-surface preferences for the article
 * reader (font size, line height, paragraph spacing, font family, alignment
 * and reading theme). The GENERIC subset of the Flutter `Setting` model
 * (`lib/models/settings.dart` + `settings_notifier_provider.dart`) that the
 * ArticleDetailsPage reads — the Bible-specific display toggles (verse
 * numbers / red letters / commentary / cross-refs) are NOT part of the article
 * reader and are deliberately omitted.
 *
 * The numeric ranges mirror the Flutter `settingsProvider` exactly (the same
 * values the Bible module's `reader-settings.ts` uses); the font list is the
 * SHARED `APP_FONT_FAMILIES` from `@/utils/fonts` (no duplication — the same
 * source the Bible toolbar uses).
 *
 * The Zustand store (`store/article-reader-settings-store.ts`) holds the
 * runtime state + persistence; these constants are the shared defaults/ranges
 * so the store, the future reader toolbar and the reader surface all read one
 * source.
 */

/** Text alignment — the SHARED `ReaderAlignment` (Flutter `FontAlignment`). */
export type ArticleReaderAlignment = ReaderAlignment;

/** Reading theme — the SHARED `ReaderTheme` (Flutter `AppThemeMode`). */
export type ArticleReaderTheme = ReaderTheme;

/** The article reader settings snapshot (the store's persisted shape). */
export interface ArticleReaderSettings {
  fontSize: number;
  lineHeight: number;
  paragraphSpacing: number;
  fontFamily: string;
  alignment: ArticleReaderAlignment;
  theme: ArticleReaderTheme;
}

/** Font sizes (px) — stepper + keyboard shortcuts clamp to this range. */
export const ARTICLE_READER_FONT_SIZE_DEFAULT = 17;
export const ARTICLE_READER_FONT_SIZE_MIN = 12;
export const ARTICLE_READER_FONT_SIZE_MAX = 30;

/** Line heights (em) — stepper + keyboard-friendly increments. */
export const ARTICLE_READER_LINE_HEIGHT_DEFAULT = 1.8;
export const ARTICLE_READER_LINE_HEIGHT_MIN = 1.0;
export const ARTICLE_READER_LINE_HEIGHT_MAX = 2.5;
export const ARTICLE_READER_LINE_HEIGHT_STEP = 0.1;

/** Paragraph spacing (px) — gap between paragraph blocks. */
export const ARTICLE_READER_PARAGRAPH_SPACING_DEFAULT = 8;
export const ARTICLE_READER_PARAGRAPH_SPACING_MIN = 0;
export const ARTICLE_READER_PARAGRAPH_SPACING_MAX = 32;
export const ARTICLE_READER_PARAGRAPH_SPACING_STEP = 2;

/** Available Devanagari font families (SHARED `@/utils/fonts`). */
export const ARTICLE_READER_FONT_FAMILIES = APP_FONT_FAMILIES;

/** The default font family (loaded via next/font in the root layout). */
export const ARTICLE_READER_DEFAULT_FONT_FAMILY = APP_DEFAULT_FONT_FAMILY;

/** Reading theme options — the SHARED `READER_THEMES` (from `AppThemeModeX`). */
export const ARTICLE_READER_THEMES = READER_THEMES;

export const ARTICLE_READER_SETTINGS_DEFAULTS: ArticleReaderSettings = {
  fontSize: ARTICLE_READER_FONT_SIZE_DEFAULT,
  lineHeight: ARTICLE_READER_LINE_HEIGHT_DEFAULT,
  paragraphSpacing: ARTICLE_READER_PARAGRAPH_SPACING_DEFAULT,
  fontFamily: ARTICLE_READER_DEFAULT_FONT_FAMILY,
  alignment: "left",
  theme: "system",
};
