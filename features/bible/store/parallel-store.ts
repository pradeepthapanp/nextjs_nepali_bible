"use client";

import { create } from "zustand";
import { DEFAULT_BIBLE_VERSION } from "../constants";
import type { ParallelPane } from "../types";

/**
 * Parallel Bible panes — the set of versions displayed side by side. All panes
 * follow the same chapter (synced from `reading-store` via `useParallelBible`).
 */
interface ParallelState {
  panes: ParallelPane[];
  addPane: (versionId: string, bookNumber: number, chapter: number) => void;
  removePane: (versionId: string) => void;
  /** Sync every pane to a chapter (called when the reader navigates). */
  setChapter: (bookNumber: number, chapter: number) => void;
  clear: () => void;
}

export const useParallelStore = create<ParallelState>()((set) => ({
  panes: [
    { versionId: DEFAULT_BIBLE_VERSION.id, bookNumber: 1, chapter: 1 },
  ],
  addPane: (versionId, bookNumber, chapter) =>
    set((state) => {
      if (state.panes.some((p) => p.versionId === versionId)) return state;
      return { panes: [...state.panes, { versionId, bookNumber, chapter }] };
    }),
  removePane: (versionId) =>
    set((state) => ({
      panes: state.panes.filter((p) => p.versionId !== versionId),
    })),
  setChapter: (bookNumber, chapter) =>
    set((state) => ({
      panes: state.panes.map((pane) => ({ ...pane, bookNumber, chapter })),
    })),
  clear: () => set({ panes: [] }),
}));
