"use client";

import { useQuery } from "@tanstack/react-query";
import { DEFAULT_COMMENTARY } from "../constants";
import { getBibleServices } from "../services";
import { bibleKeys } from "./query-keys";

/** All available commentary books (drives commentary selection). */
export function useCommentaryVersions() {
  return useQuery({
    queryKey: bibleKeys.commentaryVersions(),
    queryFn: () => getBibleServices().commentary.getCommentaryVersions(),
  });
}

/** Commentary entries for a chapter of the selected commentary book. */
export function useCommentaries(
  bookNumber: number,
  chapter: number,
  commentaryId: string = DEFAULT_COMMENTARY.id,
) {
  return useQuery({
    queryKey: bibleKeys.commentary(commentaryId, bookNumber, chapter),
    queryFn: () =>
      getBibleServices().commentary.getCommentaries(
        commentaryId,
        bookNumber,
        chapter,
      ),
    enabled: bookNumber > 0 && chapter > 0,
  });
}
