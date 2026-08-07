"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DEFAULT_COMMENTARY } from "../constants";
import { getBibleServices } from "../services";
import type {
  Chapter,
  ChapterContent,
  CommentaryEntry,
  CrossReference,
} from "../types";
import { bibleKeys } from "./query-keys";

export interface UseChapterOptions {
  enabled?: boolean;
}

/**
 * Fetches one chapter (verses + section titles) for a version. This is the
 * core "Bible reading" query; the future ChapterViewer is its primary
 * consumer. Navigation edges are computed from the books query at render time.
 */
export function useChapter(
  versionId: string,
  bookNumber: number,
  chapter: number,
  options: UseChapterOptions = {},
) {
  return useQuery({
    queryKey: bibleKeys.chapter(versionId, bookNumber, chapter),
    queryFn: async (): Promise<Chapter> => {
      const services = getBibleServices();
      const [verses, titles] = await Promise.all([
        services.bible.getVerses(versionId, bookNumber, chapter),
        services.bible.getVerseTitles(bookNumber, chapter),
      ]);
      return { versionId, bookNumber, chapter, verses, titles };
    },
    enabled: options.enabled ?? Boolean(versionId),
  });
}

export interface UseChapterContentOptions {
  /** Include cross references (default true). */
  includeCrossRefs?: boolean;
  /** Include commentary (default true). */
  includeCommentary?: boolean;
  /** Commentary book to use (defaults to the app default). */
  commentaryId?: string;
  enabled?: boolean;
}

/**
 * The reader's aggregate query: chapter verses + titles + optional cross
 * references + optional commentary — the web equivalent of the Flutter
 * `VerCmtRef` (`verse_provider.dart`). Toggles mirror the reader settings
 * (showComments / crossReferences).
 */
export function useChapterContent(
  versionId: string,
  bookNumber: number,
  chapter: number,
  options: UseChapterContentOptions = {},
) {
  const commentaryId = options.commentaryId ?? DEFAULT_COMMENTARY.id;
  const chapterQuery = useChapter(versionId, bookNumber, chapter, {
    enabled: options.enabled,
  });

  const crossReferencesQuery = useQuery({
    queryKey: bibleKeys.crossReferences(bookNumber, chapter),
    queryFn: () =>
      getBibleServices().crossReference.getCrossReferences(bookNumber, chapter),
    enabled:
      (options.includeCrossRefs ?? true) &&
      chapterQuery.isSuccess &&
      (options.enabled ?? true),
  });

  const commentaryQuery = useQuery({
    queryKey: bibleKeys.commentary(commentaryId, bookNumber, chapter),
    queryFn: () =>
      getBibleServices().commentary.getCommentaries(
        commentaryId,
        bookNumber,
        chapter,
      ),
    enabled:
      (options.includeCommentary ?? true) &&
      chapterQuery.isSuccess &&
      (options.enabled ?? true),
  });

  const includeCrossRefs = options.includeCrossRefs ?? true;
  const includeCommentary = options.includeCommentary ?? true;

  const data = useMemo<ChapterContent | undefined>(() => {
    const verses = chapterQuery.data?.verses;
    const titles = chapterQuery.data?.titles;
    if (!verses || !titles) return undefined;

    // Gate the output by the reader-settings toggles: React Query keeps a
    // disabled query's cached data, so without this the Commentary/References
    // toggles would NOT hide already-fetched content. Gating here makes the
    // visibility change instant (no reload) while the queries stay enabled
    // and cached for the next toggle-back.
    const crossReferences: CrossReference[] | undefined = includeCrossRefs
      ? (crossReferencesQuery.data ?? undefined)
      : undefined;
    const commentaries: CommentaryEntry[] | undefined = includeCommentary
      ? (commentaryQuery.data ?? undefined)
      : undefined;

    return {
      versionId,
      bookNumber,
      chapter,
      verses,
      titles,
      crossReferences,
      commentaries,
    };
  }, [
    chapterQuery.data,
    crossReferencesQuery.data,
    commentaryQuery.data,
    includeCrossRefs,
    includeCommentary,
    versionId,
    bookNumber,
    chapter,
  ]);

  return {
    data,
    isLoading: chapterQuery.isLoading,
    isError: chapterQuery.isError,
    error: chapterQuery.error,
    refetch: chapterQuery.refetch,
  };
}
