import type { SupabaseClient } from "@supabase/supabase-js";
import { unwrap } from "@/services/helpers";
import { PRAYER_DEFAULT_STATUS } from "../constants";
import type { Prayer, PrayerInput } from "../types";

/**
 * Prayer service — a direct port of the SupabaseRepository prayer methods
 * (`fetchPrayers`, `createPrayer`, `updatePrayer`, `deletePrayer`,
 * `publishPrayer`, `incrementReplyCount`, `decrementReplyCount`) from
 * `lib/providers/supabase/supabase_repository_provider.dart`, plus WEB-FIRST
 * `getPrayer` (the `/prayers/{id}` detail deep link — Flutter pushed the
 * whole object via a bottom sheet, so no fetch existed). Uses the existing
 * `prayers` table with no schema changes (verified: the table + every column
 * exist in the live backend).
 *
 * NOT ported (dead Flutter code / no Flutter support — see the arch README):
 * `incrementViewCount` and `searchPrayers` do NOT exist for prayers in
 * Flutter (the Discussion feature, which had views, is commented-out dead
 * code, and the prayers page has no search).
 */

export interface PrayerService {
  /** Paginated prayers, newest first (replaces `fetchPrayers`). */
  getPrayers(options: { limit: number; offset: number }): Promise<Prayer[]>;
  /** A single prayer by id (WEB-FIRST — the `/prayers/{id}` deep link). */
  getPrayer(id: string): Promise<Prayer | null>;
  /** Insert a prayer row (replaces `createPrayer`; `user_id`/`author_name` from the session). */
  createPrayer(input: PrayerInput): Promise<Prayer>;
  /** Update title/details/anonymous + stamp `updated_at` (replaces `updatePrayer`). */
  updatePrayer(id: string, input: PrayerInput): Promise<Prayer>;
  /** Delete a prayer row (replaces `deletePrayer`). */
  deletePrayer(id: string): Promise<void>;
  /** Mark a prayer published (replaces `publishPrayer`). */
  publishPrayer(id: string): Promise<void>;
  /**
   * WEB-FIRST: bump `prayer_count` by one (the `incrementReplyCount`
   * read-modify-write pattern). Flutter does NOT call this directly — its
   * `togglePrayer` only calls `pray`/`unPray` (the count is trigger-maintained
   * server-side and the notifier bumps the LOCAL count optimistically). This
   * explicit bump exists for the web toggle flow when a trigger does NOT
   * maintain the count — see `services/README.md`.
   */
  incrementPrayerCount(id: string): Promise<void>;
  /** Read `reply_count` → write `+1` (replaces `incrementReplyCount`). */
  incrementReplyCount(id: string): Promise<void>;
  /** Read `reply_count` → write `-1` (min 0; replaces `decrementReplyCount`). */
  decrementReplyCount(id: string): Promise<void>;
}

/** A `prayers` row as returned by Supabase (snake_case columns). */
export interface PrayerRow {
  id: string;
  title: string;
  details: string;
  user_id: string | null;
  author_name: string | null;
  is_anonymous: boolean | null;
  prayer_count: number | null;
  reply_count: number | null;
  published: boolean | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

/** Maps a `prayers` row to the domain `Prayer` (mirrors `Prayer.fromJson`). */
export function mapPrayer(row: PrayerRow): Prayer {
  return {
    id: row.id,
    title: row.title,
    details: row.details,
    userId: row.user_id ?? undefined,
    authorName: row.author_name ?? undefined,
    isAnonymous: row.is_anonymous ?? false,
    prayerCount: row.prayer_count ?? 0,
    replyCount: row.reply_count ?? 0,
    published: row.published ?? false,
    status: row.status ?? PRAYER_DEFAULT_STATUS,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabasePrayerService implements PrayerService {
  constructor(private readonly client: SupabaseClient) {}

  async getPrayers(options: {
    limit: number;
    offset: number;
  }): Promise<Prayer[]> {
    const response = await this.client
      .from("prayers")
      .select()
      .order("created_at", { ascending: false })
      .range(options.offset, options.offset + options.limit - 1);
    const rows = unwrap(response) as PrayerRow[] | null;
    return (rows ?? []).map(mapPrayer);
  }

  async getPrayer(id: string): Promise<Prayer | null> {
    const response = await this.client
      .from("prayers")
      .select()
      .eq("id", id)
      .maybeSingle();
    const row = unwrap(response) as PrayerRow | null;
    return row ? mapPrayer(row) : null;
  }

  async createPrayer(input: PrayerInput): Promise<Prayer> {
    // Flutter inserts `user_id: currentUser?.id` + `author_name` from the auth
    // user metadata (nullable — no throw, faithful).
    const user = (await this.client.auth.getSession()).data.session?.user ?? null;
    const response = await this.client
      .from("prayers")
      .insert({
        title: input.title,
        details: input.details,
        user_id: user?.id ?? null,
        author_name: user
          ? ((user.user_metadata?.["full_name"] as string | undefined) ?? null)
          : null,
        is_anonymous: input.isAnonymous,
      })
      .select()
      .single();
    const row = unwrap(response) as PrayerRow;
    return mapPrayer(row);
  }

  async updatePrayer(id: string, input: PrayerInput): Promise<Prayer> {
    const response = await this.client
      .from("prayers")
      .update({
        title: input.title,
        details: input.details,
        is_anonymous: input.isAnonymous,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    const row = unwrap(response) as PrayerRow;
    return mapPrayer(row);
  }

  async deletePrayer(id: string): Promise<void> {
    const response = await this.client.from("prayers").delete().eq("id", id);
    unwrap(response);
  }

  async publishPrayer(id: string): Promise<void> {
    const response = await this.client
      .from("prayers")
      .update({ published: true })
      .eq("id", id);
    unwrap(response);
  }

  async incrementPrayerCount(id: string): Promise<void> {
    const data = await this.client
      .from("prayers")
      .select("prayer_count")
      .eq("id", id)
      .single();
    const row = unwrap(data) as { prayer_count: number | null };
    const count = row.prayer_count ?? 0;
    const response = await this.client
      .from("prayers")
      .update({ prayer_count: count + 1 })
      .eq("id", id);
    unwrap(response);
  }

  async incrementReplyCount(id: string): Promise<void> {
    const data = await this.client
      .from("prayers")
      .select("reply_count")
      .eq("id", id)
      .single();
    const row = unwrap(data) as { reply_count: number | null };
    const count = row.reply_count ?? 0;
    const response = await this.client
      .from("prayers")
      .update({ reply_count: count + 1 })
      .eq("id", id);
    unwrap(response);
  }

  async decrementReplyCount(id: string): Promise<void> {
    const data = await this.client
      .from("prayers")
      .select("reply_count")
      .eq("id", id)
      .single();
    const row = unwrap(data) as { reply_count: number | null };
    const count = Math.max((row.reply_count ?? 0) - 1, 0);
    const response = await this.client
      .from("prayers")
      .update({ reply_count: count })
      .eq("id", id);
    unwrap(response);
  }
}
