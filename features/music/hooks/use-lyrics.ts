"use client";

import { useMemo } from "react";
import { parseLyrics } from "../parsers";
import { useSongSettingsStore } from "../store";
import type { Song } from "../types";

/**
 * useLyrics — the lyric render-tree behavior for the Song Reader.
 *
 * Composes the pure `parseLyrics` lyrics engine with `SongSettingsStore`:
 * - the render tree is memoized over `[song, lyricsLanguage, transpose]` —
 *   language switching and transpose changes recompute it, nothing else does;
 * - `showChords` is exposed (chord visibility is a render concern; the tree
 *   always carries the chord segments).
 */
export function useLyrics(song: Song | null | undefined) {
  const lyricsLanguage = useSongSettingsStore((state) => state.lyricsLanguage);
  const transpose = useSongSettingsStore((state) => state.transpose);
  const showChords = useSongSettingsStore((state) => state.showChords);

  const tree = useMemo(
    () =>
      song
        ? parseLyrics(song, { language: lyricsLanguage, transpose })
        : null,
    [song, lyricsLanguage, transpose],
  );

  return { tree, showChords, lyricsLanguage, transpose };
}
