"use client";

import { create } from "zustand";
import type { InteractionMode, SelectedVerse } from "../types";

/**
 * VerseInteractionStore — the single source of truth for verse selection and
 * the context menu.
 *
 * Ports the Flutter `VerseSelectionNotifier`
 * (`lib/providers/bible/verse_selection_provider.dart`), which kept a
 * `List<Ver>` selection with add/remove/clear/toggle. This store is richer:
 * it tracks the interaction mode, a range anchor, and the context-menu
 * position, and it stores `SelectedVerse` snapshots (data, not DOM) so the
 * selection survives scrolling and is fully independent from the page.
 *
 * Purely client UI state — no React Query, no Supabase, no business logic.
 */

export interface VerseInteractionState {
  /** Whether any verse is selected. */
  active: boolean;
  /** How selection was initiated / is being extended. */
  mode: InteractionMode;
  /** Selected verses, in selection order. */
  verses: SelectedVerse[];
  /** Verse id where a range selection started. */
  anchorId?: string;
  /** Context-menu position (opened via right-click / long-press). */
  contextMenu: { x: number; y: number } | null;

  /** Select a verse (optionally additively, e.g. Ctrl/Cmd+click). */
  selectVerse: (verse: SelectedVerse, opts?: { additive?: boolean }) => void;
  /** Toggle a verse in/out of the selection. */
  toggleVerse: (verse: SelectedVerse) => void;
  /** Start a range selection at a verse (sets the anchor). */
  beginRange: (verse: SelectedVerse) => void;
  /** Extend the range from the anchor to `end` using the chapter's order. */
  extendRangeTo: (end: SelectedVerse, ordered: SelectedVerse[]) => void;
  /** Remove a single verse from the selection. */
  removeVerse: (id: string) => void;
  /** Clear the selection and the context menu. */
  clear: () => void;
  openContextMenu: (position: { x: number; y: number }) => void;
  closeContextMenu: () => void;
}

export const useVerseInteractionStore = create<VerseInteractionState>()(
  (set, get) => ({
    active: false,
    mode: "single",
    verses: [],
    anchorId: undefined,
    contextMenu: null,

    selectVerse: (verse, { additive = false } = {}) => {
      set((state) => {
        const already = state.verses.some((v) => v.id === verse.id);
        const verses = additive
          ? already
            ? state.verses
            : [...state.verses, verse]
          : [verse];
        return {
          active: true,
          mode: additive ? "multi" : "single",
          anchorId: verse.id,
          verses,
        };
      });
    },

    toggleVerse: (verse) => {
      set((state) => {
        const exists = state.verses.some((v) => v.id === verse.id);
        const verses = exists
          ? state.verses.filter((v) => v.id !== verse.id)
          : [...state.verses, verse];
        return {
          active: verses.length > 0,
          mode: verses.length > 1 ? "multi" : "single",
          anchorId: verse.id,
          verses,
        };
      });
    },

    beginRange: (verse) => {
      set({
        active: true,
        mode: "keyboard",
        anchorId: verse.id,
        verses: [verse],
      });
    },

    extendRangeTo: (end, ordered) => {
      const anchorId = get().anchorId;
      const ids = ordered.map((verse) => verse.id);
      const a = ids.indexOf(anchorId ?? "");
      const b = ids.indexOf(end.id);
      if (a < 0 || b < 0) {
        // Anchor is not in this chapter's order — fall back to a toggle.
        set((state) => {
          const exists = state.verses.some((v) => v.id === end.id);
          const verses = exists
            ? state.verses.filter((v) => v.id !== end.id)
            : [...state.verses, end];
          return { active: verses.length > 0, mode: "multi", verses };
        });
        return;
      }
      const [start, stop] = a < b ? [a, b] : [b, a];
      set({
        active: true,
        mode: "multi",
        anchorId,
        verses: ordered.slice(start, stop + 1),
      });
    },

    removeVerse: (id) =>
      set((state) => {
        const verses = state.verses.filter((v) => v.id !== id);
        return { active: verses.length > 0, verses };
      }),

    clear: () =>
      set({
        active: false,
        mode: "single",
        verses: [],
        anchorId: undefined,
        contextMenu: null,
      }),

    openContextMenu: (position) => set({ contextMenu: position }),
    closeContextMenu: () => set({ contextMenu: null }),
  }),
);
