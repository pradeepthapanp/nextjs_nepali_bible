import type { Reference } from "./reference";

/**
 * A user note. Mirrors the Flutter `Note` model
 * (`lib/models/note.dart`). Notes may be free-standing or optionally linked to
 * a verse reference (verse-linked notes are a web-specific enhancement).
 */
export interface Note {
  id: string;
  userId: string;
  title: string;
  category?: string;
  color?: string;
  description?: string;
  /** Optional verse link (web enhancement for verse-context notes). */
  reference?: Reference;
  createdAt: string;
  updatedAt: string;
}

export type NoteInput = {
  title: string;
  category?: string;
  color?: string;
  description?: string;
  reference?: Reference;
};
