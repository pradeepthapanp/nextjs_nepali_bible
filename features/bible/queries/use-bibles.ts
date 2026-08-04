"use client";

import { useQuery } from "@tanstack/react-query";
import { getBibleServices } from "../services";
import { bibleKeys } from "./query-keys";

/** All available Bible versions (drives version selection + parallel panes). */
export function useBibles() {
  return useQuery({
    queryKey: bibleKeys.versions(),
    queryFn: () => getBibleServices().bible.getVersions(),
  });
}

/** A single Bible version by id. */
export function useBible(versionId: string) {
  return useQuery({
    queryKey: bibleKeys.version(versionId),
    queryFn: () => getBibleServices().bible.getVersionById(versionId),
    enabled: Boolean(versionId),
  });
}
