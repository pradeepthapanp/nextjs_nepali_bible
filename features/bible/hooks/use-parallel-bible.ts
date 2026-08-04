"use client";

import { useEffect } from "react";
import { useParallelStore, useReadingStore } from "../store";

/**
 * Parallel Bible behavior: manages the set of version panes and keeps them
 * synced to the reader's chapter. The future parallel view renders one
 * `useChapter` per pane from `panes`.
 */
export function useParallelBible() {
  const { panes, addPane, removePane, setChapter, clear } = useParallelStore();
  const { bookNumber, chapter } = useReadingStore();

  // Keep every pane on the reader's chapter.
  useEffect(() => {
    setChapter(bookNumber, chapter);
  }, [bookNumber, chapter, setChapter]);

  return { panes, addPane, removePane, clear };
}
