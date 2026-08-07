/**
 * Day-of-year helper — the repository's "today" computation.
 *
 * Flutter `SupabaseRepository.getDevotionSingle`:
 *   `final startOfYear = DateTime(now.year, 1, 1);`
 *   `final int today = (now.difference(startOfYear).inDays + 1);`
 * A pure port (local-time based, matching `DateTime(...)` constructor time).
 */

/** Returns the day-of-year (1..366) for a date (defaults to now). */
export function getDayOfYear(date: Date = new Date()): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  return Math.floor((date.getTime() - startOfYear.getTime()) / 86400000) + 1;
}
