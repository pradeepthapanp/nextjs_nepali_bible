/**
 * Devotion constants — extracted from the Flutter implementation
 * (`todays_devotion_page.dart` copy + the route table in `app_routes.dart`).
 * Nothing invented.
 */

/** The page/app-bar title (Flutter `TodaysDevotionPage` AppBar title). */
export const DEVOTION_TITLE = "Today's Devotion";

/** The card heading (Flutter "आजको वचन" — hard-coded in the page). */
export const DEVOTION_HEADING = "आजको वचन";

/**
 * The share title prefix — Flutter `_shareDevotional` uses
 * `'Daily Devotional -' + _todayDate`.
 */
export const DEVOTION_SHARE_TITLE_PREFIX = "Daily Devotional -";

/**
 * The date label locale — Flutter `DateFormat('EEEE, MMMM d, yyyy')`
 * (English weekday/month names). The full format is applied in
 * `utils/date.ts` (`formatDevotionDate`); this is the documented locale.
 */
export const DEVOTION_DATE_LOCALE = "en-US";
