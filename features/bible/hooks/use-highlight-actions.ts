"use client";

import { useCallback, useMemo } from "react";
import { useHighlightMutations, useHighlights } from "../queries";
import { useHighlightStore } from "../store";
import type { HighlightColor } from "../types";

/**
 * Highlight behavior — the single place that maps verse ids → highlight
 * actions. Ports the Flutter `VerseHighlightNotifier`
 * (`lib/providers/bible/verse_highlight_provider.dart`): lookup (`isHighlighted`,
 * `commonColor`/`hasColor`), multi-verse apply/clear with toggle semantics,
 * and (new on the web) an undo stack.
 *
 * Server data lives in React Query (`useHighlights` + the optimistic
 * `useHighlightMutations`); the undo stack lives in the highlight store.
 * Every helper reads the live cache, so the UI repaints instantly and rolls
 * back on error for free.
 */
export function useHighlightActions() {
  const { data: highlights } = useHighlights();
  const { save, remove, clear } = useHighlightMutations();

  // verseId → color, rebuilt when the cache changes.
  const highlightMap = useMemo<Record<string, HighlightColor>>(() => {
    const map: Record<string, HighlightColor> = {};
    for (const highlight of highlights ?? []) {
      map[highlight.verseId] = highlight.color;
    }
    return map;
  }, [highlights]);

  const highlightFor = useCallback(
    (verseId: string): HighlightColor | null => highlightMap[verseId] ?? null,
    [highlightMap],
  );

  const isHighlighted = useCallback(
    (verseId: string): boolean => Boolean(highlightMap[verseId]),
    [highlightMap],
  );

  /** The single color shared by ALL of the given verses, else null (Flutter `commonColor`). */
  const commonColor = useCallback(
    (verseIds: string[]): HighlightColor | null => {
      if (verseIds.length === 0) return null;
      let color: HighlightColor | null = null;
      for (const verseId of verseIds) {
        const current = highlightMap[verseId];
        if (!current) return null;
        if (color === null) color = current;
        else if (color !== current) return null;
      }
      return color;
    },
    [highlightMap],
  );

  // Single-verse helpers (used by future per-verse affordances).
  const apply = useCallback(
    (verseId: string, color: HighlightColor) => save.mutate({ verseId, color }),
    [save],
  );

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

  // --- Multi-verse helpers (the palette) + undo ------------------------------

  /** Records each verse's state BEFORE an operation, for undo. */
  const recordUndo = useCallback(
    (verseIds: string[]) => {
      useHighlightStore.getState().pushUndo({
        changes: verseIds.map((verseId) => ({
          verseId,
          previous: highlightMap[verseId] ?? null,
        })),
      });
    },
    [highlightMap],
  );

  /** Removes highlights from the given verses (optimistic, undoable). */
  const clearVerses = useCallback(
    (verseIds: string[]) => {
      const ids = [...new Set(verseIds)];
      if (ids.length === 0) return;
      recordUndo(ids);
      clear.mutate(ids);
    },
    [clear, recordUndo],
  );

  /**
   * Applies a colour to the given verses (optimistic, undoable), with the
   * Flutter toggle semantics: if every verse already has that exact colour,
   * the action clears them instead (so tapping the active colour un-highlights).
   */
  const applyToVerses = useCallback(
    (verseIds: string[], color: HighlightColor) => {
      const ids = [...new Set(verseIds)];
      if (ids.length === 0) return;
      if (commonColor(ids) === color) {
        clearVerses(ids);
        return;
      }
      recordUndo(ids);
      for (const verseId of ids) save.mutate({ verseId, color });
    },
    [commonColor, clearVerses, recordUndo, save],
  );

  /** Undo the last highlight operation (restore each verse's prior state). */
  const undo = useCallback(() => {
    const entry = useHighlightStore.getState().popUndo();
    if (!entry) return;
    for (const { verseId, previous } of entry.changes) {
      if (previous) save.mutate({ verseId, color: previous });
      else remove.mutate(verseId);
    }
  }, [save, remove]);

  const canUndo = useHighlightStore((state) => state.undoStack.length > 0);

  return {
    highlights,
    highlightMap,
    highlightFor,
    isHighlighted,
    commonColor,
    apply,
    toggle,
    clearVerse,
    applyToVerses,
    clearVerses,
    undo,
    canUndo,
  };
}
