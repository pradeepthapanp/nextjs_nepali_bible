import type { SupabaseClient } from "@supabase/supabase-js";
import { unwrap } from "@/services/helpers";
import type { Note, NoteInput } from "../types";

/**
 * Note service — a direct port of the SupabaseRepository note methods
 * (`fetchNotes`, `insertNote`, `updateNote`, `deleteNote`, `deleteNotes`,
 * `deleteAllNotes`) from `lib/providers/supabase/supabase_repository_provider.dart`.
 * Uses the existing `notes` table with no schema changes (verified: columns
 * `id, user_id, title, category, color, description, created_at, updated_at`).
 *
 * Notes are private/user-owned — RLS enforces row ownership; the service only
 * ever reads/writes via the signed-in client and scopes queries by `user_id`
 * (faithful to Flutter). No client-side-only permission checks (UI gates are
 * presentational only).
 */

export interface NoteService {
  /** All of the current user's notes (newest first — Flutter `fetchNotes`). */
  getNotes(): Promise<Note[]>;
  /** A single note by id (WEB-FIRST `maybeSingle`). */
  getNote(id: string): Promise<Note | null>;
  /** Insert a note (Flutter `insertNote`; requires a session). */
  createNote(input: NoteInput): Promise<Note>;
  /** Update the editable fields (Flutter `updateNote`). */
  updateNote(id: string, patch: Partial<NoteInput>): Promise<Note>;
  /** Delete a single note (Flutter `deleteNote`). */
  deleteNote(id: string): Promise<void>;
  /** Delete several notes (Flutter `deleteNotes`). */
  deleteNotes(ids: string[]): Promise<void>;
  /** Delete all of the current user's notes (Flutter `deleteAllNotes`). */
  deleteAllNotes(): Promise<void>;
}

/** A `notes` row as returned by Supabase (snake_case columns). */
export interface NoteRow {
  id: string;
  user_id: string;
  title: string;
  category: string | null;
  color: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

/** Maps a `notes` row to the domain `Note` (mirrors `Note.fromJson`). */
export function mapNote(row: NoteRow): Note {
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
        category: input.category ?? null,
        color: input.color ?? null,
        description: input.description ?? null,
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
        category: patch.category ?? null,
        color: patch.color ?? null,
        description: patch.description ?? null,
      })
      .eq("id", id)
      .select()
      .single();
    return mapNote(unwrap(response));
  }

  async deleteNote(id: string): Promise<void> {
    const response = await this.client.from("notes").delete().eq("id", id);
    unwrap(response);
  }

  async deleteNotes(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const response = await this.client.from("notes").delete().in("id", ids);
    unwrap(response);
  }

  async deleteAllNotes(): Promise<void> {
    const userId = await this.currentUserId();
    if (!userId) return;
    const response = await this.client.from("notes").delete().eq("user_id", userId);
    unwrap(response);
  }
}
