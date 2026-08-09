"use client";

import { useCallback, useEffect } from "react";
import {
  NOTE_COLOR_STORED_DEFAULT,
  NOTE_DEFAULT_CATEGORY,
} from "../constants";
import { useCreateNote, useUpdateNote } from "../queries";
import { emptyNoteDraft, useNoteEditorStore } from "../store";
import type { Note } from "../types";

/**
 * useNoteEditor — the Add/Edit note form behavior (the web equivalent of
 * `_AddEditNotePageState` in `lib/notes/add_edit_note.dart`). Composes the
 * persisted `useNoteEditorStore` draft (`notes.draft` — the shared editor
 * platform's `AutoSaveManager` writes HTML into it) + the create/update
 * mutations. `save()` validates (title + non-empty HTML content, mirroring
 * Flutter's validators) and returns the saved note; the draft is cleared on
 * success. No `Note[]` lives here — React Query owns server state.
 */
export function useNoteEditor(note?: Note) {
  const draft = useNoteEditorStore((state) => state.draft);
  const autosave = useNoteEditorStore((state) => state.autosave);
  const start = useNoteEditorStore((state) => state.start);
  const update = useNoteEditorStore((state) => state.update);
  const clear = useNoteEditorStore((state) => state.clear);
  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();

  // Seed the store from the loaded note (edit) or an empty draft (create),
  // keeping an in-progress autosave draft for the SAME note (mirrors the
  // Articles editor hook).
  useEffect(() => {
    const state = useNoteEditorStore.getState();
    if (note) {
      if (state.draft?.id === note.id) return;
      state.start({
        id: note.id,
        title: note.title,
        category: note.category ?? NOTE_DEFAULT_CATEGORY,
        color: note.color ?? NOTE_COLOR_STORED_DEFAULT,
        description: note.description ?? "",
      });
      return;
    }
    // Create mode: a stale draft belonging to a PREVIOUS note (non-null id)
    // is replaced; a persisted NEW draft (id === null) is KEPT so a refresh
    // restores the in-progress write.
    if (!state.draft || state.draft.id !== null) {
      state.start(emptyNoteDraft());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note?.id]);

  /** Validate + save the draft (create or update) — HTML content only. */
  const save = useCallback(async (): Promise<Note> => {
    const state = useNoteEditorStore.getState();
    const current = state.draft;
    if (!current) throw new Error("No draft to save");
    const title = current.title.trim();
    if (!title) throw new Error("Please enter a title");
    if (!current.description.trim()) throw new Error("Document is empty");
    const input = {
      title,
      category: current.category,
      color: current.color,
      description: current.description,
    };
    if (current.id) {
      const saved = await updateMutation.mutateAsync({
        id: current.id,
        patch: input,
      });
      state.clear();
      return saved;
    }
    const created = await createMutation.mutateAsync(input);
    state.clear();
    return created;
  }, [createMutation, updateMutation]);

  return {
    draft,
    autosave,
    hasChanges: autosave.dirty,
    isEditing: Boolean(draft?.id),
    isSaving: createMutation.isPending || updateMutation.isPending,
    update,
    start,
    clear,
    save,
    error: createMutation.error ?? updateMutation.error,
  };
}
