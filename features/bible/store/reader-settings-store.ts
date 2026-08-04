"use client";

import { create } from "zustand";
import type { ReaderAlignment } from "../components/reader/reader-toolbar";

/**
 * Reader settings — the reading-surface preferences (font size, line height,
 * alignment and the display toggles). Mirrors the Flutter `settingsProvider`
 * (`providers/global/settings_notifier_provider.dart`), which `BibleHome`
 * reads and the reader popups update.
 *
 * UI state only (Zustand). Persistence to localStorage is added with the
 * Settings feature; for now settings are session-scoped, matching the current
 * reader-store pattern.
 */

export const READER_SETTINGS_DEFAULTS = {
  fontSize: 17,
  lineHeight: 1.8,
  alignment: "left" as ReaderAlignment,
  redLetters: true,
  showComments: true,
  showCrossReferences: true,
  showVerseNumbers: true,
};

export type ReaderSettings = typeof READER_SETTINGS_DEFAULTS;

interface ReaderSettingsState extends ReaderSettings {
  setFontSize: (value: number) => void;
  setLineHeight: (value: number) => void;
  setAlignment: (alignment: ReaderAlignment) => void;
  setRedLetters: (value: boolean) => void;
  setShowComments: (value: boolean) => void;
  setShowCrossReferences: (value: boolean) => void;
  setShowVerseNumbers: (value: boolean) => void;
  reset: () => void;
}

export const useReaderSettings = create<ReaderSettingsState>()((set) => ({
  ...READER_SETTINGS_DEFAULTS,
  setFontSize: (fontSize) => set({ fontSize }),
  setLineHeight: (lineHeight) => set({ lineHeight }),
  setAlignment: (alignment) => set({ alignment }),
  setRedLetters: (redLetters) => set({ redLetters }),
  setShowComments: (showComments) => set({ showComments }),
  setShowCrossReferences: (showCrossReferences) => set({ showCrossReferences }),
  setShowVerseNumbers: (showVerseNumbers) => set({ showVerseNumbers }),
  reset: () => set({ ...READER_SETTINGS_DEFAULTS }),
}));
