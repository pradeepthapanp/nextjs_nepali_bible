"use client";

import { useQuery } from "@tanstack/react-query";
import { getBibleServices } from "../services";
import type { Reference } from "../types";
import { bibleKeys } from "./query-keys";

/** Fetches a single verse by its row uuid (used by highlights/notes anchors). */
export function useVerse(versionId: string, uuid: string) {
  return useQuery({
    queryKey: bibleKeys.verse(versionId, uuid),
    queryFn: () =>
      getBibleServices().bible.getVerseByUuid(versionId, uuid),
    enabled: Boolean(versionId) && Boolean(uuid),
  });
}

/** Fetches a single verse by book/chapter/verse reference. */
export function useVerseByReference(
  versionId: string,
  reference: Reference | null,
) {
  return useQuery({
    queryKey: bibleKeys.verseByReference(
      versionId,
      reference?.bookNumber ?? 0,
      reference?.chapter ?? 0,
      reference?.verse ?? 0,
    ),
    queryFn: () =>
      getBibleServices().bible.getVerse(versionId, reference as Reference),
    enabled: Boolean(versionId) && reference !== null,
  });
}
