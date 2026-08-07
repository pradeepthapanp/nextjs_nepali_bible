"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  DEFAULT_LYRICS_LANGUAGE,
  DEFAULT_SHOW_CHORDS,
  DEFAULT_SONG_READER_FONT_SIZE,
  DEFAULT_TRANSPOSE,
} from "../constants";
import type { LyricsLanguage, SongReaderSettings } from "../types";
import { clampFontSize, clampTranspose } from "../utils";

/**
 * Song Reader settings store — the Zustand replacement for:
 *   - `LyricsLanguageNotifier`  (lyricsLanguage, default np)
 *   - `ChordsNotifier`          (showChords, default true)
 *   - `ChordsTransposeNotifier` (transpose, default 0)
 *   - the Flutter global `settingsProvider.fontSize` used by
 *     `CustomChordWidget` (fontSize, persisted under `settings_v2`)
 *
 * UI state only. PERSISTED to localStorage (`music.song-settings`) — these
 * preferences survive app restarts, mirroring the Bible module's
 * `useReaderSettings` (`bible.reader-settings`). Setters clamp `transpose`
 * to a chromatic octave and `fontSize` to the Flutter 12–30 range by reusing
 * `clampTranspose`/`clampFontSize` from the pure layer (no duplicated
 * helpers).
 *
 * The data shape is `SongReaderSettings` (see `types/settings.ts`); this
 * interface adds the setters.
 */
export interface SongSettingsStore extends SongReaderSettings {
  setFontSize: (value: number) => void;
  setLyricsLanguage: (language: LyricsLanguage) => void;
  setShowChords: (value: boolean) => void;
  setTranspose: (value: number) => void;
  decreaseTranspose: () => void;
  increaseTranspose: () => void;
  resetTranspose: () => void;
  reset: () => void;
}

export const useSongSettingsStore = create<SongSettingsStore>()(
  persist(
    (set) => ({
      fontSize: DEFAULT_SONG_READER_FONT_SIZE,
      lyricsLanguage: DEFAULT_LYRICS_LANGUAGE,
      showChords: DEFAULT_SHOW_CHORDS,
      transpose: DEFAULT_TRANSPOSE,
      setFontSize: (fontSize) => set({ fontSize: clampFontSize(fontSize) }),
      setLyricsLanguage: (lyricsLanguage) => set({ lyricsLanguage }),
      setShowChords: (showChords) => set({ showChords }),
      setTranspose: (transpose) =>
        set({ transpose: clampTranspose(transpose) }),
      decreaseTranspose: () =>
        set((state) => ({ transpose: clampTranspose(state.transpose - 1) })),
      increaseTranspose: () =>
        set((state) => ({ transpose: clampTranspose(state.transpose + 1) })),
      resetTranspose: () => set({ transpose: DEFAULT_TRANSPOSE }),
      reset: () =>
        set({
          fontSize: DEFAULT_SONG_READER_FONT_SIZE,
          lyricsLanguage: DEFAULT_LYRICS_LANGUAGE,
          showChords: DEFAULT_SHOW_CHORDS,
          transpose: DEFAULT_TRANSPOSE,
        }),
    }),
    {
      name: "music.song-settings",
      storage: createJSONStorage(() => localStorage),
      // New fields added over time must fall back to defaults when a stored
      // snapshot predates them (merge over the full defaults) — the same
      // convention as the Bible reader-settings store.
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<SongSettingsStore>),
      }),
      version: 1,
    },
  ),
);
