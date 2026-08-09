"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { NOTE_DEFAULT_CATEGORY, NOTE_COLOR_STORED_DEFAULT } from "../constants";

/**
 * Note editor draft — the note create/edit form state, PERSISTED to
 * localStorage (`notes.draft`, via `partialize` so only the draft survives).
 * Mirrors the Articles editor store (`useArticleEditorStore`): the SHARED
 * editor platform's `AutoSaveManager` debounces HTML into
 * `update({ description })` (no second autosave mechanism). The `autosave`
 * bookkeeping (dirty/lastSavedAt) is NOT persisted — a restored draft starts
 * clean. No server data in Zustand (React Query owns the notes).
 */
export interface NoteEditorDraft {
  /** The note id being edited, or null for a brand-new draft. */
  id: string | null;
  title: string;
  category: string;
  /** Stored colour (Flutter ARGB-int string — see `hexToArgbString`). */
  color: string;
  /** HTML content (canonical format — the shared editor converts around this). */
  description: string;
}

export interface NoteEditorStore {
  draft: NoteEditorDraft | null;
  /** Autosave bookkeeping (UI state, NOT persisted — restored drafts start clean). */
  autosave: {
    dirty: boolean;
    lastSavedAt: string | null;
  };
  /** Open the editor with an initial draft (new or editing) — starts clean. */
  start: (draft: NoteEditorDraft) => void;
  /** Apply a field patch and mark the draft dirty. */
  update: (patch: Partial<NoteEditorDraft>) => void;
  /** Clear the dirty flag + stamp `lastSavedAt` after a successful save. */
  markSaved: () => void;
  /** Discard the draft (restores the autosave defaults). */
  clear: () => void;
}

export const useNoteEditorStore = create<NoteEditorStore>()(
  persist(
    (set) => ({
      draft: null,
      autosave: { dirty: false, lastSavedAt: null },
      start: (draft) =>
        set({ draft, autosave: { dirty: false, lastSavedAt: null } }),
      update: (patch) =>
        set((state) =>
          state.draft
            ? {
                draft: { ...state.draft, ...patch },
                autosave: { ...state.autosave, dirty: true },
              }
            : state,
        ),
      markSaved: () =>
        set(() => ({
          autosave: { dirty: false, lastSavedAt: new Date().toISOString() },
        })),
      clear: () =>
        set({ draft: null, autosave: { dirty: false, lastSavedAt: null } }),
    }),
    {
      name: "notes.draft",
      storage: createJSONStorage(() => localStorage),
      // Restore the draft only; autosave bookkeeping starts clean.
      partialize: (state) => ({ draft: state.draft }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<NoteEditorStore>),
      }),
      version: 1,
    },
  ),
);

/** A fresh empty draft (new note). */
export function emptyNoteDraft(): NoteEditorDraft {
  return {
    id: null,
    title: "",
    category: NOTE_DEFAULT_CATEGORY,
    color: NOTE_COLOR_STORED_DEFAULT,
    description: "",
  };
}
