import type { ReadingPosition } from "../types";

/**
 * Reading-progress service.
 *
 * NOT a Supabase table: the Flutter app persisted the reading position in the
 * local `Setting` (`bookPosition`/`chapterPosition`, shared_preferences). The
 * faithful web port is localStorage (client-only; SSR-safe no-ops).
 */

const STORAGE_KEY = "bible.reading-position";

export interface ProgressService {
  /** The user's last reading position, or null when none is saved. */
  getReadingPosition(): Promise<ReadingPosition | null>;
  /** Persist the current reading position. */
  saveReadingPosition(position: ReadingPosition): Promise<void>;
}

export class LocalProgressService implements ProgressService {
  async getReadingPosition(): Promise<ReadingPosition | null> {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ReadingPosition;
    } catch {
      return null;
    }
  }

  async saveReadingPosition(position: ReadingPosition): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
  }
}
