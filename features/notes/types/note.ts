/**
 * Note model. Mirrors the Flutter `Note` model
 * (`lib/models/note.dart`). `description` is the note's HTML content (the
 * canonical persisted format — the WYSIWYG editor converts around it).
 *
 * The `notes` table has NO Bible-reference columns (verified against the live
 * schema: `id, user_id, title, category, color, description, created_at,
 * updated_at`) — notes are free-standing user-owned records. A web "reference"
 * field is deliberately NOT added (no invented schema).
 */

export interface Note {
  id: string;
  userId: string;
  title: string;
  /** Note category (e.g. "General", "Sermon", … — see constants). */
  category?: string;
  /** Stored note colour — the Flutter ARGB-int string (or a hex fallback). */
  color?: string;
  /** The note body as HTML (the canonical stored format). */
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type NoteInput = {
  title: string;
  category?: string;
  color?: string;
  description?: string;
};
