"use client";

import { useMemo, useState } from "react";
import { NOTE_CATEGORIES } from "../constants";
import { useDeleteAllNotes, useDeleteNote, useNotes } from "../queries";
import { useNoteFilterStore } from "../store";
import { noteToPlainText } from "../utils";

/**
 * useNoteLibrary — the Notes list behavior (the web equivalent of the Flutter
 * `NotesPage` + `NotesNotifier`): the list query, the client-side category
 * filter / search / sort (Flutter filters in-memory over the loaded list —
 * no server search), and delete. Search is page-local transient state;
 * category + sort live in the UI store. Server data stays in React Query.
 */
export function useNoteLibrary() {
  const { data: notes, isLoading, isError, error, refetch } = useNotes();
  const { category, sort, setCategory, setSort } = useNoteFilterStore();
  const [search, setSearch] = useState("");
  const deleteMutation = useDeleteNote();
  const deleteAllMutation = useDeleteAllNotes();

  // Category chips: canonical `NOTE_CATEGORIES` order first, then any
  // categories present in the data but not in the list (sorted).
  const categories = useMemo(() => {
    const present = new Set(
      (notes ?? [])
        .map((note) => note.category)
        .filter((value): value is string => Boolean(value)),
    );
    const canonical = NOTE_CATEGORIES.filter((value) => present.has(value));
    const extra = [...present]
      .filter((value) => !(NOTE_CATEGORIES as readonly string[]).includes(value))
      .sort((a, b) => a.localeCompare(b));
    return [...canonical, ...extra];
  }, [notes]);

  // Client-side category + search + sort over the loaded list (Flutter
  // `_filterNotes` + `sortNotes`): search matches title / category / the
  // HTML-stripped description text.
  const filtered = useMemo(() => {
    let list = notes ?? [];
    if (category) list = list.filter((note) => note.category === category);
    const query = search.trim().toLowerCase();
    if (query) {
      list = list.filter((note) => {
        const title = note.title.toLowerCase();
        const cat = (note.category ?? "").toLowerCase();
        const text = noteToPlainText(note.description).toLowerCase();
        return (
          title.includes(query) || cat.includes(query) || text.includes(query)
        );
      });
    }
    const sorted = [...list];
    switch (sort) {
      case "latest":
        sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
      case "oldest":
        sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        break;
      case "alphabetical":
        sorted.sort((a, b) =>
          a.title.toLowerCase().localeCompare(b.title.toLowerCase()),
        );
        break;
    }
    return sorted;
  }, [notes, category, search, sort]);

  return {
    notes: notes ?? [],
    filtered,
    categories,
    search,
    setSearch,
    category,
    setCategory,
    sort,
    setSort,
    deleteNote: (id: string) => deleteMutation.mutate(id),
    deleteAll: () => deleteAllMutation.mutate(),
    isPending: deleteMutation.isPending || deleteAllMutation.isPending,
    isLoading,
    isError,
    error,
    refetch,
  };
}
