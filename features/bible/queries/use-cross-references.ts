"use client";

import { useQuery } from "@tanstack/react-query";
import { getBibleServices } from "../services";
import type { CrossReference } from "../types";
import { bibleKeys } from "./query-keys";

/** Raw cross references for a chapter (feeds the cross-ref markers). */
export function useCrossReferences(bookNumber: number, chapter: number) {
  return useQuery({
    queryKey: bibleKeys.crossReferences(bookNumber, chapter),
    queryFn: () =>
      getBibleServices().crossReference.getCrossReferences(bookNumber, chapter),
    enabled: bookNumber > 0 && chapter > 0,
  });
}

/**
 * Resolves a set of cross references (book metadata + target text) — used by
 * the future ReferenceVersesSheet.
 */
export function useResolvedReferences(
  references: CrossReference[] | undefined,
  versionId: string,
) {
  return useQuery({
    queryKey: bibleKeys.resolvedCrossReferences(versionId),
    queryFn: () =>
      getBibleServices().crossReference.resolveReferences(
        references ?? [],
        versionId,
      ),
    enabled: Boolean(versionId) && Boolean(references?.length),
  });
}
