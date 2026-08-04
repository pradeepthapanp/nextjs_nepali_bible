"use client";

import { useSelectionStore } from "../store";

/**
 * Exposes the verse-selection store as a hook so the future ChapterViewer /
 * VerseContextSheet can select single verses or ranges for copy, share,
 * parallel compare, bulk highlight and bulk note actions.
 */
export function useVerseSelection() {
  const { mode, selectedVerseIds, anchorVerseId, begin, extend, toggle, clear } =
    useSelectionStore();

  return { mode, selectedVerseIds, anchorVerseId, begin, extend, toggle, clear };
}
