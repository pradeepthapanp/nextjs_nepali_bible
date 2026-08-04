"use client";

import { useCallback } from "react";
import { useNoteMutations, useNotes } from "../queries";
import type { NoteInput, Reference } from "../types";

/**
 * Note behavior for the reader: create a note (optionally linked to a verse
 * reference / the current selection), update and delete. Server data lives in
 * React Query; this hook owns the "note for this verse" mapping.
 */
export function useNoteActions() {
  const { data: notes } = useNotes();
  const { create, update, remove, clearAll } = useNoteMutations();

  const createForReference = useCallback(
    (reference: Reference, input: Omit<NoteInput, "reference">) =>
      create.mutate({ ...input, reference }),
    [create],
  );

  const notesForReference = useCallback(
    (reference: Reference) =>
      notes?.filter(
        (note) =>
          note.reference?.bookNumber === reference.bookNumber &&
          note.reference?.chapter === reference.chapter,
      ),
    [notes],
  );

  return { notes, notesForReference, createForReference, update, remove, clearAll };
}
