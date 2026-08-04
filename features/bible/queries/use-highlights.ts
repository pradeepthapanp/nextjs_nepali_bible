"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBibleServices } from "../services";
import type { HighlightInput } from "../types";
import { bibleKeys } from "./query-keys";

/** All of the user's highlights (indexed by verse uuid at the call site). */
export function useHighlights() {
  return useQuery({
    queryKey: bibleKeys.highlights.all(),
    queryFn: () => getBibleServices().highlight.getHighlights(),
  });
}

/**
 * Highlight mutations. Each invalidates the highlights cache so the reader
 * re-colours verses after save/delete.
 */
export function useHighlightMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: bibleKeys.highlights.all() });

  const save = useMutation({
    mutationFn: (input: HighlightInput) =>
      getBibleServices().highlight.saveHighlight(input),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (verseId: string) =>
      getBibleServices().highlight.deleteHighlight(verseId),
    onSuccess: invalidate,
  });

  const clear = useMutation({
    mutationFn: (verseIds: string[]) =>
      getBibleServices().highlight.clearHighlights(verseIds),
    onSuccess: invalidate,
  });

  const clearAll = useMutation({
    mutationFn: () => getBibleServices().highlight.deleteAllHighlights(),
    onSuccess: invalidate,
  });

  return { save, remove, clear, clearAll };
}
