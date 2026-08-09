"use client";

import { create } from "zustand";
import type { NoteSort } from "../constants";

/**
 * Note filter — UI state only (list category chip + sort), mirroring the
 * Flutter `NotesPage` widget fields (`_selectedCategory` + the sort dialog).
 * NOT persisted (transient UI, like `useNoticeSortStore`). The list data
 * itself lives in React Query — never in Zustand.
 */
export interface NoteFilterStore {
  /** Selected category (null = "All"). */
  category: string | null;
  sort: NoteSort;
  setCategory: (category: string | null) => void;
  setSort: (sort: NoteSort) => void;
}

export const useNoteFilterStore = create<NoteFilterStore>((set) => ({
  category: null,
  sort: "latest",
  setCategory: (category) => set({ category }),
  setSort: (sort) => set({ sort }),
}));
