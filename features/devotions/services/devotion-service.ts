import type { SupabaseClient } from "@supabase/supabase-js";
import { unwrap } from "@/services/helpers";
import { getDayOfYear } from "../utils";
import type { Devotion } from "../types";

/** A raw `devotions` table row (snake_case, the mapped shape before domain
 * conversion). Columns VERIFIED against the live backend. */
export interface DevotionRow {
  id: string;
  day: number;
  devotion: string;
  created_at: string;
}

/** Maps a raw `devotions` row to the domain `Devotion` (snake_case → camelCase). */
export function mapDevotion(row: DevotionRow): Devotion {
  return {
    id: row.id,
    day: row.day,
    devotion: row.devotion,
    createdAt: row.created_at,
  };
}

/**
 * DevotionService — the data layer for the `devotions` table (READ-ONLY).
 * Ports `SupabaseRepository.getDevotionSingle`
 * (`lib/providers/supabase/supabase_repository_provider.dart`): computes
 * today's day-of-year and fetches the `devotions` row for that day.
 *
 * WEB ADAPTATION: Flutter uses `.single()` (throws when no row exists → the
 * page shows the ERROR state). The web uses `.maybeSingle()` → `null` so the
 * page can distinguish "no devotion today" (EmptyState) from a real error.
 */
export class DevotionService {
  constructor(private readonly client: SupabaseClient) {}

  /** Today's devotion — day-of-year → `devotions` eq day, or null when absent. */
  async getDailyDevotion(): Promise<Devotion | null> {
    const response = await this.client
      .from("devotions")
      .select("id, day, devotion, created_at")
      .eq("day", getDayOfYear(new Date()))
      .maybeSingle();
    const row = unwrap(response) as DevotionRow | null;
    return row ? mapDevotion(row) : null;
  }
}
