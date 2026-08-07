"use client";

import { useQuery } from "@tanstack/react-query";
import { getBibleServices } from "../services";
import { bibleKeys } from "./query-keys";

/**
 * Content-availability checks — whether a Bible version or commentary book has
 * ANY rows at all. Used to give a clear message when a version/commentary
 * exists in the `bibles`/`commentaries` tables but its data table is empty
 * (e.g. NEPS or MacArthur have no imported rows yet), instead of a confusing
 * "empty chapter" / silent no-commentary state.
 */

/** Whether the Bible version has any verses (detects empty version tables). */
export function useVersionHasVerses(versionId: string | undefined) {
  return useQuery({
    queryKey: bibleKeys.versionHasVerses(versionId ?? ""),
    queryFn: () => getBibleServices().bible.hasVerses(versionId as string),
    enabled: Boolean(versionId),
  });
}

/** Whether a commentary book has any entries (detects empty commentary tables). */
export function useCommentaryHasContent(commentaryId: string | undefined) {
  return useQuery({
    queryKey: bibleKeys.commentaryHasContent(commentaryId ?? ""),
    queryFn: () => getBibleServices().commentary.hasContent(commentaryId as string),
    enabled: Boolean(commentaryId),
  });
}