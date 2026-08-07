import type { MapTopic } from "../types";

/**
 * React Query cache keys for Maps (mirrors `musicKeys` / `songsKeys` /
 * `articlesKeys`). This file is the cache-key HIERARCHY CONTRACT only — the
 * query/mutation HOOKS land in a later phase (see `README.md`).
 *
 *   - `topics()`      — `getBibleMapTopics` (`mapsTopicsProvider`).
 *   - `byTopic(t)`    — `getMapsByTopic(topic)` (`mapListProvider(topic)`).
 *   - `detail(id)`    — WEB-FIRST single-map lookup for the `/maps/view/{id}`
 *                       deep link (Flutter pushes the viewer with the whole
 *                       object; the web resolves by id — no Flutter family
 *                       key maps 1:1, this is the web's own cache slot).
 */
export const mapKeys = {
  all: () => ["maps"] as const,
  topics: () => ["maps", "topics"] as const,
  byTopic: (topic: MapTopic) => ["maps", "list", topic] as const,
  detail: (id: string) => ["maps", "detail", id] as const,
};
