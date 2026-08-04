"use client";

import { useCallback } from "react";
import { useHighlightMutations, useHighlights } from "../queries";
import type { HighlightColor } from "../types";

/**
 * Highlight behavior for the reader: looks up an existing highlight for a
 * verse and toggles it on/off with a colour. Server data lives in React Query
 * (`useHighlights`); this hook is the single place that maps verseId → action.
 */
export function useHighlightActions() {
  const { data: highlights } = useHighlights();
  const { save, remove } = useHighlightMutations();

  const highlightFor = useCallback(
    (verseId: string) =>
      highlights?.find((highlight) => highlight.verseId === verseId),
    [highlights],
  );

  /** Apply a colour, replacing any existing highlight on the verse. */
  const apply = useCallback(
    (verseId: string, color: HighlightColor) => save.mutate({ verseId, color }),
    [save],
  );

  /** Toggle: remove if highlighted, else apply. */
  const toggle = useCallback(
    (verseId: string, color: HighlightColor) => {
      if (highlightFor(verseId)) {
        remove.mutate(verseId);
      } else {
        save.mutate({ verseId, color });
      }
    },
    [highlightFor, save, remove],
  );

  const clearVerse = useCallback(
    (verseId: string) => remove.mutate(verseId),
    [remove],
  );

  return { highlights, highlightFor, apply, toggle, clearVerse };
}
