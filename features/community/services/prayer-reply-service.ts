import type { SupabaseClient } from "@supabase/supabase-js";
import { unwrap } from "@/services/helpers";
import type { PrayerReply, PrayerReplyInput, PrayerReplyUpdate } from "../types";

/**
 * Prayer-reply service — the prayer-comments service (the `prayer_replies`
 * table). A direct port of the SupabaseRepository reply methods
 * (`fetchReplies`, `createReply`, `editReply`, `deleteReply`). Prayer replies
 * ARE the community's comments; a generic cross-feature `CommentService` is
 * intentionally NOT created (`prayer_replies` ≠ `article_comments` — different
 * tables/schemas, so a forced abstraction would be invented architecture).
 *
 * The reply-count sync (increment/decrement) lives on `PrayerService` (it
 * updates `prayers.reply_count`) — faithful to Flutter, where the
 * `PrayerRepliesNotifier` calls `PrayersNotifier.incrementReplyCount`.
 */

export interface PrayerReplyService {
  /** The replies of a prayer, newest first (replaces `fetchReplies`). */
  getReplies(prayerId: string): Promise<PrayerReply[]>;
  /** Insert a reply row (replaces `createReply`; `user_id`/`author_name` from the session). */
  createReply(input: PrayerReplyInput): Promise<PrayerReply>;
  /** Update the reply text + stamp `updated_at` (replaces `editReply`). */
  updateReply(input: PrayerReplyUpdate): Promise<PrayerReply>;
  /** Delete a reply row (replaces `deleteReply`). */
  deleteReply(replyId: string): Promise<void>;
  /** Maps every `prayer_replies` row to an actual per-prayer reply count
   * (prayerId → count) — lists derive TRUE comment counts from this, since
   * the `prayers.reply_count` column can drift stale (historically doubled). */
  getReplyCounts(): Promise<Record<string, number>>;
}

/** A `prayer_replies` row as returned by Supabase (snake_case columns). */
export interface PrayerReplyRow {
  id: string;
  prayer_id: string;
  user_id: string | null;
  author_name: string | null;
  reply: string;
  created_at: string;
  updated_at: string;
}

/** Maps a `prayer_replies` row to the domain `PrayerReply` (mirrors `fromJson`). */
export function mapPrayerReply(row: PrayerReplyRow): PrayerReply {
  return {
    id: row.id,
    prayerId: row.prayer_id,
    userId: row.user_id ?? undefined,
    authorName: row.author_name ?? undefined,
    reply: row.reply,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabasePrayerReplyService implements PrayerReplyService {
  constructor(private readonly client: SupabaseClient) {}

  async getReplies(prayerId: string): Promise<PrayerReply[]> {
    const response = await this.client
      .from("prayer_replies")
      .select()
      .eq("prayer_id", prayerId)
      .order("created_at", { ascending: false });
    const rows = unwrap(response) as PrayerReplyRow[] | null;
    return (rows ?? []).map(mapPrayerReply);
  }

  async createReply(input: PrayerReplyInput): Promise<PrayerReply> {
    // Flutter inserts `user_id: currentUser?.id` + `author_name` from the auth
    // user metadata (nullable — no throw, faithful).
    const user = (await this.client.auth.getSession()).data.session?.user ?? null;
    const response = await this.client
      .from("prayer_replies")
      .insert({
        prayer_id: input.prayerId,
        user_id: user?.id ?? null,
        author_name: user
          ? ((user.user_metadata?.["full_name"] as string | undefined) ?? null)
          : null,
        reply: input.reply,
      })
      .select()
      .single();
    const row = unwrap(response) as PrayerReplyRow;
    return mapPrayerReply(row);
  }

  async updateReply(input: PrayerReplyUpdate): Promise<PrayerReply> {
    const response = await this.client
      .from("prayer_replies")
      .update({ reply: input.reply, updated_at: new Date().toISOString() })
      .eq("id", input.replyId)
      .select()
      .single();
    const row = unwrap(response) as PrayerReplyRow;
    return mapPrayerReply(row);
  }

  async deleteReply(replyId: string): Promise<void> {
    const response = await this.client
      .from("prayer_replies")
      .delete()
      .eq("id", replyId);
    unwrap(response);
  }

  /** Maps every `prayer_replies` row to an actual per-prayer reply count
   * (prayerId → count). The `prayers.reply_count` column can drift stale
   * (historically doubled by a double-increment), so lists derive the true
   * count from the reply rows. Paged in 1000-row chunks (PostgREST caps a
   * bare `.select()` at 1000 rows). */
  async getReplyCounts(): Promise<Record<string, number>> {
    const CHUNK = 1000;
    const counts: Record<string, number> = {};
    for (let offset = 0; ; offset += CHUNK) {
      const response = await this.client
        .from("prayer_replies")
        .select("prayer_id")
        .range(offset, offset + CHUNK - 1);
      const rows = (unwrap(response) ?? []) as { prayer_id: string }[];
      for (const row of rows) {
        counts[row.prayer_id] = (counts[row.prayer_id] ?? 0) + 1;
      }
      if (rows.length < CHUNK) break;
    }
    return counts;
  }
}
