import type { SupabaseClient } from "@supabase/supabase-js";
import { unwrap } from "@/services/helpers";
import type { BibleMap, MapTopic } from "../types";

/**
 * Map service — a direct port of the SupabaseRepository map methods
 * (`getBibleMapTopics`, `getMapsByTopic`) from
 * `lib/providers/supabase/supabase_repository_provider.dart`, plus one
 * WEB-FIRST method (`getMapById`) needed by the `/maps/view/{id}` deep link.
 * Uses the existing `bible_maps` table + the existing `get_bible_map_topics`
 * RPC — no schema changes, no invented tables/APIs.
 *
 * Maps is READ-ONLY public content: there are no create/update/delete methods
 * (Flutter has none) and no auth gating, so this service needs no upload or
 * profile services (unlike Articles/Songs).
 */

export interface MapService {
  /**
   * The distinct map topics (replaces `getBibleMapTopics`). Calls the
   * `get_bible_map_topics` RPC, which returns `[{ topic: string }]` rows
   * (VERIFIED live — 19 topics) that are mapped to plain topic strings.
   */
  getTopics(): Promise<MapTopic[]>;
  /**
   * All maps in a topic, ordered by `created_at` ASCENDING (replaces
   * `getMapsByTopic`). No pagination — Flutter returns every row.
   */
  getMapsByTopic(topic: MapTopic): Promise<BibleMap[]>;
  /**
   * A single map by id, or null (WEB-FIRST — Flutter pushes the whole
   * `BibleMap` via `Navigator.push` with no fetch; the web resolves
   * `/maps/view/{id}` by primary key so it is deep-link/refresh-safe).
   */
  getMapById(id: string): Promise<BibleMap | null>;
}

/** A `bible_maps` row as returned by Supabase (snake_case columns). */
interface BibleMapRow {
  id: string;
  topic: string | null;
  title: string | null;
  image_url: string | null;
  created_at: string;
}

/** A `get_bible_map_topics` RPC row (the RPC returns `{ topic }` objects). */
interface MapTopicRow {
  topic: string;
}

/** Maps a `bible_maps` row to the domain `BibleMap` (mirrors `BibleMap.fromJson`). */
export function mapBibleMap(row: BibleMapRow): BibleMap {
  return {
    id: row.id,
    topic: row.topic ?? "",
    title: row.title ?? "",
    imageUrl: row.image_url ?? "",
    createdAt: row.created_at,
  };
}

/** Maps a `get_bible_map_topics` RPC row to a `MapTopic` string. */
export function mapTopic(row: MapTopicRow): MapTopic {
  return row.topic;
}

export class SupabaseMapService implements MapService {
  constructor(private readonly client: SupabaseClient) {}

  async getTopics(): Promise<MapTopic[]> {
    const response = await this.client.rpc("get_bible_map_topics");
    const rows = unwrap(response) as MapTopicRow[] | null;
    return (rows ?? []).map(mapTopic);
  }

  async getMapsByTopic(topic: MapTopic): Promise<BibleMap[]> {
    const response = await this.client
      .from("bible_maps")
      .select()
      .ilike("topic", topic)
      .order("created_at", { ascending: true });
    const rows = unwrap(response) as BibleMapRow[] | null;
    return (rows ?? []).map(mapBibleMap);
  }

  async getMapById(id: string): Promise<BibleMap | null> {
    const response = await this.client
      .from("bible_maps")
      .select()
      .eq("id", id)
      .maybeSingle();
    const row = unwrap(response) as BibleMapRow | null;
    return row ? mapBibleMap(row) : null;
  }
}
