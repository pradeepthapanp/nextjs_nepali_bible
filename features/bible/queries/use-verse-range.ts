"use client";

import { useMemo } from "react";
import { useChapter } from "./use-chapter";
import type { Reference, Verse } from "../types";

export interface VerseRangeQuery {
  /** The target chapter/verse(s) to fetch. */
  reference: Reference;
  /** Optional inclusive verse range end — when omitted, only `verse` shows. */
  verseToEnd?: number;
}

/**
 * Fetches a chapter's verses (single query, cached per chapter) and filters
 * to the requested verse range — the popup's data source for reflinks,
 * cross-references and commentary anchors.
 *
 * IMPORTANT: reads through `useChapter` (NOT a standalone `getVerses` query)
 * so it shares ONE React Query cache entry — and ONE `Chapter` data shape —
 * with the reader. Historically this hook used its own `getVerses` queryFn
 * under the same `bibleKeys.chapter` key as the reader, which overwrote the
 * shared cache with a bare `Verse[]` and made the reader render
 * "This chapter is empty" (see use-chapter.ts). Re-opening a popup for the
 * on-screen chapter is also instant since the reader already populated that
 * exact cache entry.
 */
export function useVerseRange(
  versionId: string,
  { reference, verseToEnd }: VerseRangeQuery,
  enabled: boolean,
) {
  const bookNumber = reference?.bookNumber ?? 0;
  const chapter = reference?.chapter ?? 0;

  const chapterQuery = useChapter(versionId, bookNumber, chapter, {
    enabled: enabled && Boolean(versionId) && bookNumber > 0 && chapter > 0,
  });

  const verses = useMemo<Verse[]>(() => {
    const start = reference?.verse ?? 1;
    // `0` is the database's "no end" sentinel (cross_references stores 0 for
    // a single-verse target) — treat it like undefined so a single verse
    // isn't filtered out by an empty range.
    const end = verseToEnd && verseToEnd > 0 ? verseToEnd : start;
    return (chapterQuery.data?.verses ?? []).filter(
      (verse) => verse.verse >= start && verse.verse <= end,
    );
  }, [chapterQuery.data, reference?.verse, verseToEnd]);

  return {
    data: verses,
    isLoading: chapterQuery.isLoading,
    isError: chapterQuery.isError,
  };
}
