"use client";

import { create } from "zustand";

/**
 * Verse selection UI state — single verse, or a range of verses. Powers copy,
 * share, parallel compare and bulk highlight/note actions in the reader.
 * (The Flutter app tracked selection inside reader widgets; here it is one
 * reusable store.)
 */
export type SelectionMode = "none" | "single" | "range";

interface SelectionState {
  mode: SelectionMode;
  selectedVerseIds: string[];
  /** Verse where a range selection started. */
  anchorVerseId?: string;
  /** Start a single/range selection at a verse. */
  begin: (verseId: string) => void;
  /** Extend a range to a verse (same chapter). */
  extend: (verseId: string) => void;
  /** Toggle a single verse in/out of the selection. */
  toggle: (verseId: string) => void;
  clear: () => void;
}

export const useSelectionStore = create<SelectionState>()((set, get) => ({
  mode: "none",
  selectedVerseIds: [],
  anchorVerseId: undefined,
  begin: (verseId) =>
    set({ mode: "single", selectedVerseIds: [verseId], anchorVerseId: verseId }),
  extend: (verseId) => {
    const anchor = get().anchorVerseId;
    set((state) => ({
      mode: "range",
      selectedVerseIds: anchor
        ? orderedRange(anchor, verseId, state.selectedVerseIds)
        : [...state.selectedVerseIds, verseId],
    }));
  },
  toggle: (verseId) =>
    set((state) => ({
      mode: "none",
      selectedVerseIds: state.selectedVerseIds.includes(verseId)
        ? []
        : [verseId],
      anchorVerseId: verseId,
    })),
  clear: () => set({ mode: "none", selectedVerseIds: [], anchorVerseId: undefined }),
}));

/**
 * Placeholder range ordering — the reader will pass the ordered verse list of
 * the current chapter so anchor..extend can be computed deterministically.
 */
function orderedRange(
  anchor: string,
  end: string,
  current: string[],
): string[] {
  void anchor;
  void end;
  return current;
}
