"use client";

import { useCallback } from "react";
import { useReadingStore, useRecentStore } from "../store";
import { useDeepLink } from "./use-deep-link";
import { useReadingPosition } from "./use-reading-position";

/**
 * useBibleNavigation — the single navigation entry point for the reader.
 *
 * Every "go somewhere" action (prev/next in BibleHome, book/chapter/version
 * selection in the pickers, future verse jumps) goes through `goTo` /
 * `goToVersion`, so navigation stays consistent and unduplicated:
 *   - `goTo(book, chapter, verse?)`  → persist reading position (openChapter),
 *     push the deep-link URL (browser history + refresh-safe location), and
 *     record the book in the recent list.
 *   - `goToVersion(versionId)`       → set the version, push the URL with
 *     `?v=`, and record the version in the recent list.
 *
 * The URL is the source of truth while on `/bible` routes (see `useDeepLink`),
 * so back/forward and refresh "just work"; the reading store mirrors the URL
 * and the progress service persists the last position.
 */
export function useBibleNavigation() {
  const { openChapter } = useReadingPosition();
  const { navigate } = useDeepLink();
  const setVersion = useReadingStore((state) => state.setVersion);
  const pushBook = useRecentStore((state) => state.pushBook);
  const pushVersion = useRecentStore((state) => state.pushVersion);

  /** Navigate to a chapter (optionally targeting a verse). */
  const goTo = useCallback(
    (bookNumber: number, chapter: number, verse?: number) => {
      const versionId = useReadingStore.getState().versionId;
      openChapter(bookNumber, chapter, verse);
      navigate(
        verse
          ? { kind: "verse", bookNumber, chapter, verse, versionId }
          : { kind: "chapter", bookNumber, chapter, versionId },
      );
      pushBook(bookNumber);
    },
    [openChapter, navigate, pushBook],
  );

  /** Switch the Bible version, keeping the current book/chapter. */
  const goToVersion = useCallback(
    (versionId: string) => {
      const { bookNumber, chapter } = useReadingStore.getState();
      setVersion(versionId);
      navigate({ kind: "chapter", bookNumber, chapter, versionId });
      pushVersion(versionId);
    },
    [setVersion, navigate, pushVersion],
  );

  return { goTo, goToVersion };
}
