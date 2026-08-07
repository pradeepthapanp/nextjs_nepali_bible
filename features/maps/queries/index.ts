/**
 * Barrel for the Maps React Query layer — the cache-key hierarchy + the
 * query hooks (read-only feature: no mutation hooks).
 *
 *   query-keys.ts   mapKeys — { all, topics, byTopic(topic), detail(id) }
 *   use-maps.ts     useMapTopics / useMapsByTopic / useMap (web-first)
 */

export * from "./query-keys";
export * from "./use-maps";
