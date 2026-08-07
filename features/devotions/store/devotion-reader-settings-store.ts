"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  DEVOTION_FONT_SIZE_MAX,
  DEVOTION_FONT_SIZE_MIN,
  DEVOTION_LINE_HEIGHT_MAX,
  DEVOTION_LINE_HEIGHT_MIN,
  DEVOTION_LINE_HEIGHT_STEP,
  DEVOTION_PARAGRAPH_SPACING_MAX,
  DEVOTION_PARAGRAPH_SPACING_MIN,
  DEVOTION_READER_SETTINGS_DEFAULTS,
  type DevotionAlignment,
  type DevotionReaderSettings,
  type DevotionTheme,
} from "../constants";

/**
 * Devotion reader settings store — the reading-surface preferences for the
 * devotion HTML (font size, line height, paragraph spacing, font family,
 * alignment, reading theme). Mirrors the Flutter `settingsProvider`
 * (`providers/global/settings_notifier_provider.dart`), which
 * `TodaysDevotionPage` reads (`fontPt` / `fontAlignment` / `lineHeight`).
 *
 * Feature-local (the Bible/Articles per-feature reader-settings precedent):
 * the shape is the SHARED `ReaderSettingsContextValue` (`@components/reader`),
 * so the SHARED `ReaderToolbar`/`ReaderSettingsPanel`/`ReaderSettingsProvider`
 * work for the devotion with no changes. The shared `@/utils/fonts` supplies
 * the font list (no duplication).
 *
 * UI state only (Zustand). PERSISTED to localStorage (`devotions.reader-settings`)
 * so preferences survive reloads. Setters clamp to the shared ranges — the
 * toolbar steppers + the settings panel both go through here.
 */

export type { DevotionReaderSettings };

interface DevotionReaderSettingsState extends DevotionReaderSettings {
  setFontSize: (value: number) => void;
  setLineHeight: (value: number) => void;
  setParagraphSpacing: (value: number) => void;
  setFontFamily: (value: string) => void;
  setAlignment: (alignment: DevotionAlignment) => void;
  setTheme: (theme: DevotionTheme) => void;
  reset: () => void;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const roundLineHeight = (value: number) =>
  Number(
    (
      Math.round(value / DEVOTION_LINE_HEIGHT_STEP) * DEVOTION_LINE_HEIGHT_STEP
    ).toFixed(1),
  );

export const useDevotionReaderSettingsStore = create<DevotionReaderSettingsState>()(
  persist(
    (set) => ({
      ...DEVOTION_READER_SETTINGS_DEFAULTS,
      setFontSize: (fontSize) =>
        set({
          fontSize: clamp(fontSize, DEVOTION_FONT_SIZE_MIN, DEVOTION_FONT_SIZE_MAX),
        }),
      setLineHeight: (lineHeight) =>
        set({
          lineHeight: clamp(
            roundLineHeight(lineHeight),
            DEVOTION_LINE_HEIGHT_MIN,
            DEVOTION_LINE_HEIGHT_MAX,
          ),
        }),
      setParagraphSpacing: (paragraphSpacing) =>
        set({
          paragraphSpacing: clamp(
            paragraphSpacing,
            DEVOTION_PARAGRAPH_SPACING_MIN,
            DEVOTION_PARAGRAPH_SPACING_MAX,
          ),
        }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setAlignment: (alignment) => set({ alignment }),
      setTheme: (theme) => set({ theme }),
      reset: () => set({ ...DEVOTION_READER_SETTINGS_DEFAULTS }),
    }),
    {
      name: "devotions.reader-settings",
      storage: createJSONStorage(() => localStorage),
      // New fields added over time must fall back to defaults when a stored
      // snapshot predates them (merge over the full defaults).
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<DevotionReaderSettingsState>),
      }),
      version: 1,
    },
  ),
);
