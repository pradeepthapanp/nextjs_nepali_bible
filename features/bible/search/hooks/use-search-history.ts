"use client";

import { useCallback } from "react";
import { useSearchHistoryStore } from "../store";

/**
 * Search history behavior — a thin wrapper over the persisted history store,
 * exposing `commit(query)` for when a search is actually run (Enter / a chip).
 */
export function useSearchHistory() {
  const entries = useSearchHistoryStore((state) => state.entries);
  const push = useSearchHistoryStore((state) => state.push);
  const remove = useSearchHistoryStore((state) => state.remove);
  const clear = useSearchHistoryStore((state) => state.clear);

  const commit = useCallback((query: string) => push(query), [push]);

  return { entries, commit, remove, clear };
}
