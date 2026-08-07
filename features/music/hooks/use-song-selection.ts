"use client";

import { useCallback, useState } from "react";

/**
 * useSongSelection — the currently selected lyric text in the Song Reader
 * (for copy/share affordances). This is transient, per-surface UI state held
 * in local state — there is no store because it never leaves the reader
 * surface and never needs to survive a re-mount.
 */
export interface SongSelection {
  songId: string;
  text: string;
}

export function useSongSelection() {
  const [selection, setSelection] = useState<SongSelection | null>(null);

  const select = useCallback((songId: string, text: string) => {
    setSelection({ songId, text });
  }, []);

  const clear = useCallback(() => setSelection(null), []);

  return { selection, select, clear };
}
