"use client";

import { create } from "zustand";
import { DEFAULT_BOOK_NUMBER } from "../constants";
import { useReadingStore } from "./reading-store";

/**
 * Bible selection dialog UI state — mirrors the Flutter `VerSelection` screen
 * (`lib/bible/ver_selection.dart`), which is a tabbed selector with a
 * BOOK/CHAPTER (and VERSE, not built yet) tab. Transient UI state only: the
 * chosen book is held here until a chapter is picked (which performs the
 * actual navigation), so selecting a book doesn't churn the URL.
 */

export type BibleSelectionTab = "book" | "chapter";

interface BibleSelectionState {
  /** Whether the dialog is visible. */
  open: boolean;
  /** Active tab. */
  tab: BibleSelectionTab;
  /** Pending book — the book whose chapters the CHAPTER tab shows. */
  bookNumber: number;
  /** Opens the dialog, defaulting the pending book to the reading position. */
  openDialog: (tab?: BibleSelectionTab) => void;
  close: () => void;
  setTab: (tab: BibleSelectionTab) => void;
  setBookNumber: (bookNumber: number) => void;
}

export const useBibleSelectionStore = create<BibleSelectionState>()((set) => ({
  open: false,
  tab: "book",
  bookNumber: DEFAULT_BOOK_NUMBER,
  openDialog: (tab = "book") =>
    set({
      open: true,
      tab,
      bookNumber: useReadingStore.getState().bookNumber,
    }),
  close: () => set({ open: false }),
  setTab: (tab) => set({ tab }),
  setBookNumber: (bookNumber) => set({ bookNumber }),
}));
