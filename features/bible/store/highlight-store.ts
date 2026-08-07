"use client";

import { create } from "zustand";
import type { HighlightColor } from "../types";

/**
 * Highlight feature UI state — the palette open/close flag and the undo stack.
 *
 * This is the ONLY new store the Highlight feature needs. Server data stays in
 * React Query (`useHighlights`); the selection comes from the existing
 * `verse-interaction-store`; so this store is just the two pieces of UI state
 * the palette owns (mirrors the `bible-selection-store` pattern for dialogs).
 */

/** One highlight change inside an undo entry (the verse's state BEFORE). */
export interface HighlightUndoChange {
  verseId: string;
  previous: HighlightColor | null;
}

/** An undoable highlight operation (one apply/clear over several verses). */
export interface HighlightUndoEntry {
  changes: HighlightUndoChange[];
}

interface HighlightStoreState {
  paletteOpen: boolean;
  undoStack: HighlightUndoEntry[];
  openPalette: () => void;
  closePalette: () => void;
  togglePalette: () => void;
  pushUndo: (entry: HighlightUndoEntry) => void;
  popUndo: () => HighlightUndoEntry | undefined;
  clearUndo: () => void;
}

const MAX_UNDO = 20;

export const useHighlightStore = create<HighlightStoreState>()((set, get) => ({
  paletteOpen: false,
  undoStack: [],

  openPalette: () => set({ paletteOpen: true }),
  closePalette: () => set({ paletteOpen: false }),
  togglePalette: () => set((state) => ({ paletteOpen: !state.paletteOpen })),

  pushUndo: (entry) =>
    set((state) => ({
      undoStack: [...state.undoStack, entry].slice(-MAX_UNDO),
    })),
  popUndo: () => {
    const { undoStack } = get();
    if (undoStack.length === 0) return undefined;
    const entry = undoStack[undoStack.length - 1];
    set({ undoStack: undoStack.slice(0, -1) });
    return entry;
  },
  clearUndo: () => set({ undoStack: [] }),
}));
