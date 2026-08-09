"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getNoteServices } from "../services";
import type { Note, NoteInput } from "../types";
import { noteKeys } from "./query-keys";

/** All of the user's notes (newest first). */
export function useNotes() {
  return useQuery({
    queryKey: noteKeys.lists(),
    queryFn: () => getNoteServices().note.getNotes(),
  });
}

/** A single note by id (WEB-FIRST; enabled only when an id is present). */
export function useNote(id?: string) {
  return useQuery({
    queryKey: noteKeys.detail(id ?? ""),
    queryFn: () => getNoteServices().note.getNote(id as string),
    enabled: Boolean(id),
  });
}

/** Read a note's list-cache row (imperative helper for the editor). */
export function noteFromCache(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
): Note | undefined {
  const list = queryClient.getQueryData<Note[]>(noteKeys.lists());
  return list?.find((note) => note.id === id);
}

/** Create a note — NETWORK-FIRST (Flutter awaits before updating state). */
export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NoteInput) => getNoteServices().note.createNote(input),
    onSuccess: (created) => {
      queryClient.setQueryData<Note[]>(noteKeys.lists(), (current) => [
        created,
        ...(current ?? []),
      ]);
      void queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
}

/** Update a note — NETWORK-FIRST (in-place in the list cache + detail). */
export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<NoteInput> }) =>
      getNoteServices().note.updateNote(id, patch),
    onSuccess: (updated) => {
      queryClient.setQueryData<Note[]>(noteKeys.lists(), (current) =>
        (current ?? []).map((note) => (note.id === updated.id ? updated : note)),
      );
      queryClient.setQueryData(noteKeys.detail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
}

/** Delete a note — NETWORK-FIRST (removed from the list cache on success). */
export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getNoteServices().note.deleteNote(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Note[]>(noteKeys.lists(), (current) =>
        (current ?? []).filter((note) => note.id !== id),
      );
      queryClient.removeQueries({ queryKey: noteKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
}

/** Delete all of the user's notes (Flutter `deleteAllNotes`). */
export function useDeleteAllNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => getNoteServices().note.deleteAllNotes(),
    onSuccess: () => {
      queryClient.setQueryData<Note[]>(noteKeys.lists(), []);
      void queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
}
