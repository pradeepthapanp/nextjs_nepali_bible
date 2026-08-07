/**
 * Devotion domain type — a direct port of the Flutter `Devotion` model
 * (`lib/models/devotion.dart`, Supabase `devotions` table), following the web
 * convention (snake_case rows → camelCase domain, ISO string dates).
 *
 * Table columns VERIFIED against the live backend (`devotions` exists with
 * exactly these columns — see `services/README.md` and the arch-phase probe).
 */

/** A daily devotion (a `devotions` table row). */
export interface Devotion {
  id: string;
  /** The day-of-year (1..366) this devotion is for — the query key
   * (Flutter `Devotion.day`; the repository computes today and fetches
   * `.eq('day', today)`). */
  day: number;
  /** The devotion body — HTML (rendered by the devotion content component,
   * never shown raw). */
  devotion: string;
  createdAt: string;
}
