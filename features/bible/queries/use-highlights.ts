"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBibleServices } from "../services";
import type { Highlight, HighlightInput } from "../types";
import { bibleKeys } from "./query-keys";

/** All of the user's highlights (indexed by verse uuid at the call site). */
export function useHighlights() {
  return useQuery({
    queryKey: bibleKeys.highlights.all(),
    queryFn: () => getBibleServices().highlight.getHighlights(),
  });
}

/**
 * A local, optimistic highlight snapshot. The server row's real id/timestamps
 * replace it after settle; the placeholder keeps the cache type-complete so
 * the UI can repaint instantly.
 */
function optimisticHighlight(input: HighlightInput): Highlight {
  const now = new Date().toISOString();
  return {
    id: `optimistic-${input.verseId}`,
    userId: "",
    verseId: input.verseId,
    color: input.color,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Highlight mutations with OFFLINE OPTIMISTIC updates.
 *
 * Every mutation applies its change to the highlights cache immediately
 * (`onMutate`, after cancelling in-flight queries), snapshots the previous
 * state, rolls it back on error, and invalidates the cache when settled so the
 * server row (real id/timestamps) replaces the optimistic one.
 *
 * This is the web equivalent of the Flutter `VerseHighlightNotifier`'s
 * optimistic `state = AsyncData(...)` + rollback-on-error pattern, but the
 * React Query cache is the single source of truth — no duplicated local
 * state, and any consumer (reader, search, palette) repaints for free.
 */
export function useHighlightMutations() {
  const queryClient = useQueryClient();
  const key = bibleKeys.highlights.all();

  const save = useMutation({
    mutationFn: (input: HighlightInput) =>
      getBibleServices().highlight.saveHighlight(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Highlight[]>(key);
      queryClient.setQueryData<Highlight[]>(key, (current = []) => {
        const exists = current.some((h) => h.verseId === input.verseId);
        const optimistic = optimisticHighlight(input);
        return exists
          ? current.map((h) => (h.verseId === input.verseId ? optimistic : h))
          : [...current, optimistic];
      });
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: key });
    },
  });

  const remove = useMutation({
    mutationFn: (verseId: string) =>
      getBibleServices().highlight.deleteHighlight(verseId),
    onMutate: async (verseId) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Highlight[]>(key);
      queryClient.setQueryData<Highlight[]>(key, (current = []) =>
        current.filter((h) => h.verseId !== verseId),
      );
      return { previous };
    },
    onError: (_error, _verseId, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: key });
    },
  });

  const clear = useMutation({
    mutationFn: (verseIds: string[]) =>
      getBibleServices().highlight.clearHighlights(verseIds),
    onMutate: async (verseIds) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Highlight[]>(key);
      const ids = new Set(verseIds);
      queryClient.setQueryData<Highlight[]>(key, (current = []) =>
        current.filter((h) => !ids.has(h.verseId)),
      );
      return { previous };
    },
    onError: (_error, _ids, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: key });
    },
  });

  const clearAll = useMutation({
    mutationFn: () => getBibleServices().highlight.deleteAllHighlights(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Highlight[]>(key);
      queryClient.setQueryData<Highlight[]>(key, []);
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: key });
    },
  });

  return { save, remove, clear, clearAll };
}
