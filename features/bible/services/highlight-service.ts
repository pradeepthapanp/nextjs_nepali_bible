import type { SupabaseClient } from "@supabase/supabase-js";
import type { Highlight, HighlightColor, HighlightInput } from "../types";
import { unwrap } from "./helpers";

/**
 * Verse highlight service — a direct port of the SupabaseRepository highlight
 * methods (`fetchHighlights`, `saveHighlight`, `deleteHighlight`,
 * `deleteHighlightById`, `clearHighlights`, `deleteAllHighlights`). Uses the
 * existing `verse_highlights` table (including the `onConflict:
 * 'user_id,verse_id'` upsert) with no schema changes.
 */

export interface HighlightService {
  /** All of the current user's highlights. */
  getHighlights(): Promise<Highlight[]>;
  /** Create or update the highlight for a verse. */
  saveHighlight(input: HighlightInput): Promise<Highlight>;
  /** Remove the highlight for a verse. */
  deleteHighlight(verseId: string): Promise<void>;
  /** Remove a highlight by its row id. */
  deleteHighlightById(id: string): Promise<void>;
  /** Remove highlights for a set of verses (bulk). */
  clearHighlights(verseIds: string[]): Promise<void>;
  /** Remove every highlight for the user. */
  deleteAllHighlights(): Promise<void>;
}

interface HighlightRow {
  id: string;
  user_id: string;
  verse_id: string;
  color: string;
  created_at: string;
  updated_at: string;
}

function mapHighlight(row: HighlightRow): Highlight {
  return {
    id: row.id,
    userId: row.user_id,
    verseId: row.verse_id,
    color: row.color as HighlightColor,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseHighlightService implements HighlightService {
  constructor(private readonly client: SupabaseClient) {}

  /** The signed-in user id, or null (equivalent to Flutter's `currentUser`). */
  private async currentUserId(): Promise<string | null> {
    const { data } = await this.client.auth.getSession();
    return data.session?.user.id ?? null;
  }

  private async requireUserId(): Promise<string> {
    const userId = await this.currentUserId();
    if (!userId) throw new Error("User not signed in");
    return userId;
  }

  async getHighlights(): Promise<Highlight[]> {
    const userId = await this.currentUserId();
    if (!userId) return [];
    const response = await this.client
      .from("verse_highlights")
      .select()
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return unwrap(response).map(mapHighlight);
  }

  async saveHighlight(input: HighlightInput): Promise<Highlight> {
    const userId = await this.requireUserId();
    const response = await this.client
      .from("verse_highlights")
      .upsert(
        {
          user_id: userId,
          verse_id: input.verseId,
          color: input.color,
        },
        { onConflict: "user_id,verse_id" },
      )
      .select()
      .single();
    return mapHighlight(unwrap(response));
  }

  async deleteHighlight(verseId: string): Promise<void> {
    const userId = await this.currentUserId();
    if (!userId) return;
    await this.client
      .from("verse_highlights")
      .delete()
      .eq("user_id", userId)
      .eq("verse_id", verseId);
  }

  async clearHighlights(verseIds: string[]): Promise<void> {
    const userId = await this.requireUserId();
    if (verseIds.length === 0) throw new Error("No verses to clear");
    await this.client
      .from("verse_highlights")
      .delete()
      .eq("user_id", userId)
      .in("verse_id", verseIds);
  }

  async deleteHighlightById(id: string): Promise<void> {
    const userId = await this.currentUserId();
    if (!userId) return;
    await this.client
      .from("verse_highlights")
      .delete()
      .eq("user_id", userId)
      .eq("id", id);
  }

  async deleteAllHighlights(): Promise<void> {
    const userId = await this.currentUserId();
    if (!userId) return;
    await this.client.from("verse_highlights").delete().eq("user_id", userId);
  }
}
