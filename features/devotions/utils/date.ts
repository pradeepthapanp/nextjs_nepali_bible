/**
 * Devotion date formatting — the "आजको मिति" row under the heading.
 *
 * Flutter `TodaysDevotionPage._todayDate`:
 *   `DateFormat('EEEE, MMMM d, yyyy').format(DateTime.now())`
 * (English weekday/month names — the locale constant `DEVOTION_DATE_LOCALE`).
 */

import { DEVOTION_DATE_LOCALE } from "../constants";

/** Formats a date as "Friday, August 7, 2026" (Flutter `EEEE, MMMM d, yyyy`). */
export function formatDevotionDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat(DEVOTION_DATE_LOCALE, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
