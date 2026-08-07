"use client";

import { useQuery } from "@tanstack/react-query";
import { getMusicServices } from "../services";
import { musicKeys } from "./query-keys";

/**
 * Single-song query — WEB-FIRST. `enabled` (default true) lets consumers
 * compose the query conditionally.
 */
export function useSong(id: string, enabled = true) {
  return useQuery({
    queryKey: musicKeys.song(id),
    queryFn: () => getMusicServices().song.getSongById(id),
    enabled,
  });
}
