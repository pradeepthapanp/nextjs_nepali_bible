import type { SupabaseClient } from "@supabase/supabase-js";
import type { Note, NoteInput } from "../types";
import { unwrap } from "./helpers";

/**
 * Note service — a direct port of the SupabaseRepository note methods
 * (`fetchNotes`, `insertNote`, `updateNote`, `deleteNote`, `deleteNotes`,
 * `deleteAllNotes`). Uses the existing `notes` table with no schema changes.
 *
 * NOTE: the `Note.reference` field (verse-linked notes) is a web enhancement —
 * the `notes` table has no such column, so it is never read or written here
 * and stays `undefined` for DB-backed notes.
 */

export interface NoteService {
  /** All of the current user's notes. */
  getNotes(): Promise<Note[]>;
  /** A single note by id. */
  getNote(id: string): Promise<Note | null>;
  createNote(input: NoteInput): Promise<Note>;
  updateNote(id: string, patch: Partial<NoteInput>): Promise<Note>;
  deleteNote(id: string): Promise<void>;
  deleteNotes(ids: string[]): Promise<void>;
  deleteAllNotes(): Promise<void>;
}

interface NoteRow {
  id: string;
  user_id: string;
  title: string;
  category: string | null;
  color: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

function mapNote(row: NoteRow): Note {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    category: row.category ?? undefined,
    color: row.color ?? undefined,
    description: row.description ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseNoteService implements NoteService {
  constructor(private readonly client: SupabaseClient) {}

  private async currentUserId(): Promise<string | null> {
    const { data } = await this.client.auth.getSession();
    return data.session?.user.id ?? null;
  }

  private async requireUserId(): Promise<string> {
    const userId = await this.currentUserId();
    if (!userId) throw new Error("User not authenticated");
    return userId;
  }

  async getNotes(): Promise<Note[]> {
    const userId = await this.currentUserId();
    if (!userId) return [];
    const response = await this.client
      .from("notes")
      .select()
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return unwrap(response).map(mapNote);
  }

  async getNote(id: string): Promise<Note | null> {
    const response = await this.client
      .from("notes")
      .select()
      .eq("id", id)
      .maybeSingle();
    const row = unwrap(response) as NoteRow | null;
    return row ? mapNote(row) : null;
  }

  async createNote(input: NoteInput): Promise<Note> {
    const userId = await this.requireUserId();
    const response = await this.client
      .from("notes")
      .insert({
        user_id: userId,
        title: input.title,
        category: input.category,
        color: input.color,
        description: input.description,
      })
      .select()
      .single();
    return mapNote(unwrap(response));
  }

  async updateNote(id: string, patch: Partial<NoteInput>): Promise<Note> {
    const response = await this.client
      .from("notes")
      .update({
        title: patch.title,
        category: patch.category,
        color: patch.color,
        description: patch.description,
      })
      .eq("id", id)
      .select()
      .single();
    return mapNote(unwrap(response));
  }

  async deleteNote(id: string): Promise<void> {
    await this.client.from("notes").delete().eq("id", id);
  }

  async deleteNotes(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await this.client.from("notes").delete().in("id", ids);
  }

  async deleteAllNotes(): Promise<void> {
    const userId = await this.currentUserId();
    if (!userId) return;
    await this.client.from("notes").delete().eq("user_id", userId);
  }
}
