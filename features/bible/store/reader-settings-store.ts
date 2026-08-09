"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  READER_FONT_SIZE_MAX,
  READER_FONT_SIZE_MIN,
  READER_LINE_HEIGHT_MAX,
  READER_LINE_HEIGHT_MIN,
  READER_LINE_HEIGHT_STEP,
  READER_PARAGRAPH_SPACING_MAX,
  READER_PARAGRAPH_SPACING_MIN,
  READER_SETTINGS_DEFAULTS,
  type ReaderAlignment,
  type ReaderSettings,
  type ReaderTheme,
} from "../constants";

/**
 * Reader settings — the reading-surface preferences (font size, line height,
 * paragraph spacing, font family, alignment, reading theme and the display
 * toggles). Mirrors the Flutter `settingsProvider`
 * (`providers/global/settings_notifier_provider.dart`), which `BibleHome`,
 * `ChapterViewer` and search results read and the reader toolbar updates.
 *
 * UI state only (Zustand). Persisted to localStorage (`bible.reader-settings`)
 * like Flutter's `SharedPreferences` `settings_v2`, so preferences survive
 * reloads. Setters clamp to the shared ranges (no per-caller clamping —
 * toolbar steppers and keyboard shortcuts both go through here).
 */

export type { ReaderSettings };

interface ReaderSettingsState extends ReaderSettings {
  setFontSize: (value: number) => void;
  setLineHeight: (value: number) => void;
  setParagraphSpacing: (value: number) => void;
  setFontFamily: (value: string) => void;
  setAlignment: (alignment: ReaderAlignment) => void;
  setTheme: (theme: ReaderTheme) => void;
  setRedLetters: (value: boolean) => void;
  setShowComments: (value: boolean) => void;
  setShowCrossReferences: (value: boolean) => void;
  setShowVerseNumbers: (value: boolean) => void;
  setShowEnglishVerses: (value: boolean) => void;
  setCommentaryId: (commentaryId: string) => void;
  reset: () => void;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const roundLineHeight = (value: number) =>
  Number(
    (Math.round(value / READER_LINE_HEIGHT_STEP) * READER_LINE_HEIGHT_STEP).toFixed(1),
  );

export const useReaderSettings = create<ReaderSettingsState>()(
  persist(
    (set) => ({
      ...READER_SETTINGS_DEFAULTS,
      setFontSize: (fontSize) =>
        set({
          fontSize: clamp(fontSize, READER_FONT_SIZE_MIN, READER_FONT_SIZE_MAX),
        }),
      setLineHeight: (lineHeight) =>
        set({
          lineHeight: clamp(
            roundLineHeight(lineHeight),
            READER_LINE_HEIGHT_MIN,
            READER_LINE_HEIGHT_MAX,
          ),
        }),
      setParagraphSpacing: (paragraphSpacing) =>
        set({
          paragraphSpacing: clamp(
            paragraphSpacing,
            READER_PARAGRAPH_SPACING_MIN,
            READER_PARAGRAPH_SPACING_MAX,
          ),
        }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setAlignment: (alignment) => set({ alignment }),
      setTheme: (theme) => set({ theme }),
      setRedLetters: (redLetters) => set({ redLetters }),
      setShowComments: (showComments) => set({ showComments }),
      setShowCrossReferences: (showCrossReferences) =>
        set({ showCrossReferences }),
      setShowVerseNumbers: (showVerseNumbers) => set({ showVerseNumbers }),
      setShowEnglishVerses: (showEnglishVerses) => set({ showEnglishVerses }),
      setCommentaryId: (commentaryId) => set({ commentaryId }),
      reset: () => set({ ...READER_SETTINGS_DEFAULTS }),
    }),
    {
      name: "bible.reader-settings",
      storage: createJSONStorage(() => localStorage),
      // New fields added over time must fall back to defaults when a stored
      // snapshot predates them (merge over the full defaults).
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<ReaderSettingsState>),
      }),
      version: 1,
    },
  ),
);
