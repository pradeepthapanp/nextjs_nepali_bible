/**
 * A concrete Bible translation. Mirrors the Flutter `Bible` model
 * (`lib/models/bible.dart`) — what the Flutter app calls "Bible" (a version
 * with its own verses table) is modelled here as `BibleVersion`, and the
 * domain aggregate `Bible` (types/bible.ts) represents the sacred text as a
 * whole.
 */

export type BibleLanguage = "ne" | "en";

export interface BibleVersion {
  id: string;
  name: string;
  /** The Supabase table that stores this version's verses (e.g. `bible_verses_nnrv_np`). */
  tableName: string;
  shortCode: string;
  title?: string;
  description?: string;
  /**
   * The `bibles` table has no language column — the service infers this from
   * the table name (`_np` → Nepali, `_en` → English) when possible.
   */
  language?: BibleLanguage;
  /** Whether this is the default version shown on first launch. */
  isDefault?: boolean;
}
