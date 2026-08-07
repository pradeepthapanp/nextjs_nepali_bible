"use client";

import { useCallback } from "react";
import { useSongSettingsStore } from "../store";
import type { LyricsLanguage, Song } from "../types";
import { transposeSong } from "../utils";

/**
 * useTranspose — the chord transpose behavior for the Song Reader.
 *
 * Composes `SongSettingsStore.transpose` (UI state, clamped by the store
 * setters) with the pure `transposeSong` utility — transpose logic is never
 * duplicated here. Exposes the current amount plus increment/decrement/reset
 * and `transposeLyrics(song, language?)` (the transposed lyric text).
 */
export function useTranspose() {
  const transpose = useSongSettingsStore((state) => state.transpose);
  const increase = useSongSettingsStore((state) => state.increaseTranspose);
  const decrease = useSongSettingsStore((state) => state.decreaseTranspose);
  const reset = useSongSettingsStore((state) => state.resetTranspose);

  /** Transposes a song's selected lyrics by the current amount. */
  const transposeLyrics = useCallback(
    (song: Song, language?: LyricsLanguage) =>
      transposeSong(song, transpose, { language }),
    [transpose],
  );

  return { transpose, increase, decrease, reset, transposeLyrics };
}
