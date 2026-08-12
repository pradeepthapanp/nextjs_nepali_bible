"use client";

import { useQuery } from "@tanstack/react-query";
import { getBibleServices } from "../services";
import type { Reference, Verse } from "../types";
import { bibleKeys } from "./query-keys";

export interface VerseRangeQuery {
  /** The target chapter/verse(s) to fetch. */
  reference: Reference;
  /** Optional inclusive verse range end — when omitted, only `verse` shows. */
  verseToEnd?: number;
}

/**
 * Fetches a chapter's verses (single query, cached per chapter) and filters
 * to the requested verse range — the popup's data source for reflinks,
 * cross-references and commentary anchors. Reuses the same chapter cache as
 * the reader (`bibleKeys.chapter`), so re-opening a popup is instant.
 */
export function useVerseRange(
  versionId: string,
  { reference, verseToEnd }: VerseRangeQuery,
  enabled: boolean,
) {
  const bookNumber = reference?.bookNumber ?? 0;
  const chapter = reference?.chapter ?? 0;

  return useQuery({
    queryKey: bibleKeys.chapter(versionId, bookNumber, chapter),
    queryFn: () =>
      getBibleServices().bible.getVerses(versionId, bookNumber, chapter),
    enabled: enabled && Boolean(versionId) && bookNumber > 0 && chapter > 0,
    select: (verses: Verse[]): Verse[] => {
      const start = reference?.verse ?? 1;
      // `0` is the database's "no end" sentinel (cross_references stores 0 for
      // a single-verse target) — treat it like undefined so a single verse
      // isn't filtered out by an empty range.
      const end = verseToEnd && verseToEnd > 0 ? verseToEnd : start;
      return verses.filter(
        (verse) => verse.verse >= start && verse.verse <= end,
      );
    },
  });
}
