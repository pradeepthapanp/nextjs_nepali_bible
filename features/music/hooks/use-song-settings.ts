"use client";

import { useSongSettingsStore } from "../store";
import { formatTranspose } from "../utils";

/**
 * useSongSettings — wraps the persisted `SongSettingsStore` and exposes
 * derived display values. All clamping happens inside the store setters
 * (which reuse the pure `clampTranspose`/`clampFontSize` helpers), so this
 * hook never re-clamps or re-derives business logic.
 */
export function useSongSettings() {
  const fontSize = useSongSettingsStore((state) => state.fontSize);
  const lyricsLanguage = useSongSettingsStore((state) => state.lyricsLanguage);
  const showChords = useSongSettingsStore((state) => state.showChords);
  const transpose = useSongSettingsStore((state) => state.transpose);
  const setFontSize = useSongSettingsStore((state) => state.setFontSize);
  const setLyricsLanguage = useSongSettingsStore(
    (state) => state.setLyricsLanguage,
  );
  const setShowChords = useSongSettingsStore((state) => state.setShowChords);
  const setTranspose = useSongSettingsStore((state) => state.setTranspose);
  const decreaseTranspose = useSongSettingsStore(
    (state) => state.decreaseTranspose,
  );
  const increaseTranspose = useSongSettingsStore(
    (state) => state.increaseTranspose,
  );
  const resetTranspose = useSongSettingsStore(
    (state) => state.resetTranspose,
  );
  const reset = useSongSettingsStore((state) => state.reset);

  return {
    fontSize,
    lyricsLanguage,
    showChords,
    transpose,
    // Derived display values.
    isNepali: lyricsLanguage === "np",
    fontSizeDisplay: `${fontSize}pt`,
    transposeDisplay: formatTranspose(transpose),
    setFontSize,
    setLyricsLanguage,
    setShowChords,
    setTranspose,
    decreaseTranspose,
    increaseTranspose,
    resetTranspose,
    reset,
  };
}
