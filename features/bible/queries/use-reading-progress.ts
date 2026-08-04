"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBibleServices } from "../services";
import type { ReadingPosition } from "../types";
import { bibleKeys } from "./query-keys";

/** The user's last reading position (restored on app open / deep link). */
export function useReadingProgress() {
  return useQuery({
    queryKey: bibleKeys.progress(),
    queryFn: () => getBibleServices().progress.getReadingPosition(),
    staleTime: Infinity, // local data; refreshed deliberately
  });
}

/** Persists the reading position (called as the user navigates chapters). */
export function useSaveReadingProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (position: ReadingPosition) =>
      getBibleServices().progress.saveReadingPosition(position),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: bibleKeys.progress() }),
  });
}
