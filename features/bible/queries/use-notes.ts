"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBibleServices } from "../services";
import type { NoteInput } from "../types";
import { bibleKeys } from "./query-keys";

/** All of the user's notes. */
export function useNotes() {
  return useQuery({
    queryKey: bibleKeys.notes.all(),
    queryFn: () => getBibleServices().note.getNotes(),
  });
}

/** Note mutations — each invalidates the notes cache on success. */
export function useNoteMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: bibleKeys.notes.all() });

  const create = useMutation({
    mutationFn: (input: NoteInput) =>
      getBibleServices().note.createNote(input),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<NoteInput> }) =>
      getBibleServices().note.updateNote(id, patch),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => getBibleServices().note.deleteNote(id),
    onSuccess: invalidate,
  });

  const clearAll = useMutation({
    mutationFn: () => getBibleServices().note.deleteAllNotes(),
    onSuccess: invalidate,
  });

  return { create, update, remove, clearAll };
}
