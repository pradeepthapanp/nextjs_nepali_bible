"use client";

import { useQuery } from "@tanstack/react-query";
import { getMapServices } from "../services";
import type { MapTopic } from "../types";
import { mapKeys } from "./query-keys";

/**
 * Maps queries — the React Query replacement for the Flutter map providers:
 *   - `useMapTopics`  → `mapsTopicsProvider` (`getBibleMapTopics` RPC);
 *   - `useMapsByTopic` → `mapListProvider(topic)` (autoDispose family,
 *     `getMapsByTopic`);
 *   - `useMap(id)`    → WEB-FIRST single-map lookup for the `/maps/view/{id}`
 *     deep link (Flutter pushed the whole object via `Navigator.push`).
 *
 * All server state lives in the React Query cache (no Zustand) and every query
 * goes through the shared `MapServices` — never Supabase directly. Maps is
 * read-only, so there are no mutation hooks.
 */
export function useMapTopics() {
  return useQuery({
    queryKey: mapKeys.topics(),
    queryFn: () => getMapServices().map.getTopics(),
  });
}

/**
 * Maps in a topic, ordered by `created_at` ascending (replaces
 * `mapListProvider(topic)`). Gated on a non-empty topic (the deep-link topic
 * is URL-decoded on the page and passed in); single-shot finite list — the
 * RPC/service has no pagination, matching Flutter.
 */
export function useMapsByTopic(topic: MapTopic | undefined) {
  return useQuery({
    queryKey: mapKeys.byTopic(topic ?? ""),
    queryFn: () => getMapServices().map.getMapsByTopic(topic as MapTopic),
    enabled: Boolean(topic),
  });
}

/**
 * A single map by id, or null (WEB-FIRST deep-link resolution for the map
 * viewer — analogous to `useArticle(id)` / `useSong(id)`).
 */
export function useMap(id: string | undefined) {
  return useQuery({
    queryKey: mapKeys.detail(id ?? ""),
    queryFn: () => getMapServices().map.getMapById(id as string),
    enabled: Boolean(id),
  });
}
