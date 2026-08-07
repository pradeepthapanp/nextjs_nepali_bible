"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  ARTICLE_READER_FONT_SIZE_MAX,
  ARTICLE_READER_FONT_SIZE_MIN,
  ARTICLE_READER_LINE_HEIGHT_MAX,
  ARTICLE_READER_LINE_HEIGHT_MIN,
  ARTICLE_READER_LINE_HEIGHT_STEP,
  ARTICLE_READER_PARAGRAPH_SPACING_MAX,
  ARTICLE_READER_PARAGRAPH_SPACING_MIN,
  ARTICLE_READER_SETTINGS_DEFAULTS,
  type ArticleReaderAlignment,
  type ArticleReaderSettings,
  type ArticleReaderTheme,
} from "../constants";

/**
 * Article reader settings store — the reading-surface preferences for the
 * article reader (font size, line height, paragraph spacing, font family,
 * alignment, reading theme). Mirrors the Flutter `settingsProvider`
 * (`providers/global/settings_notifier_provider.dart`), which
 * `ArticleDetailsPage` reads (`fontPt` / `fontAlignment` / `lineHeight`).
 *
 * Feature-local (like the Music `useSongSettingsStore`): the Bible module's
 * `useReaderSettings` mixes the same generic fields with Bible-specific
 * toggles and is NOT shared, so Articles keeps its own persisted copy of the
 * GENERIC subset (`ArticleReaderSettings`). The shared `@/utils/fonts` supplies
 * the font list (no duplication).
 *
 * UI state only (Zustand). PERSISTED to localStorage (`articles.reader-settings`)
 * so preferences survive reloads. Setters clamp to the shared ranges — the
 * future toolbar steppers and keyboard shortcuts both go through here.
 */

export type { ArticleReaderSettings };

interface ArticleReaderSettingsState extends ArticleReaderSettings {
  setFontSize: (value: number) => void;
  setLineHeight: (value: number) => void;
  setParagraphSpacing: (value: number) => void;
  setFontFamily: (value: string) => void;
  setAlignment: (alignment: ArticleReaderAlignment) => void;
  setTheme: (theme: ArticleReaderTheme) => void;
  reset: () => void;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const roundLineHeight = (value: number) =>
  Number(
    (Math.round(value / ARTICLE_READER_LINE_HEIGHT_STEP) * ARTICLE_READER_LINE_HEIGHT_STEP).toFixed(1),
  );

export const useArticleReaderSettingsStore = create<ArticleReaderSettingsState>()(
  persist(
    (set) => ({
      ...ARTICLE_READER_SETTINGS_DEFAULTS,
      setFontSize: (fontSize) =>
        set({
          fontSize: clamp(
            fontSize,
            ARTICLE_READER_FONT_SIZE_MIN,
            ARTICLE_READER_FONT_SIZE_MAX,
          ),
        }),
      setLineHeight: (lineHeight) =>
        set({
          lineHeight: clamp(
            roundLineHeight(lineHeight),
            ARTICLE_READER_LINE_HEIGHT_MIN,
            ARTICLE_READER_LINE_HEIGHT_MAX,
          ),
        }),
      setParagraphSpacing: (paragraphSpacing) =>
        set({
          paragraphSpacing: clamp(
            paragraphSpacing,
            ARTICLE_READER_PARAGRAPH_SPACING_MIN,
            ARTICLE_READER_PARAGRAPH_SPACING_MAX,
          ),
        }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setAlignment: (alignment) => set({ alignment }),
      setTheme: (theme) => set({ theme }),
      reset: () => set({ ...ARTICLE_READER_SETTINGS_DEFAULTS }),
    }),
    {
      name: "articles.reader-settings",
      storage: createJSONStorage(() => localStorage),
      // New fields added over time must fall back to defaults when a stored
      // snapshot predates them (merge over the full defaults).
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<ArticleReaderSettingsState>),
      }),
      version: 1,
    },
  ),
);
