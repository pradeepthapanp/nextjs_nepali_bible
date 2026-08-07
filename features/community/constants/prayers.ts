/**
 * Prayer constants — extracted from the Flutter implementation
 * (`prayers_provider.dart` `_pageSize`, `edit_prayer_sheet.dart` validators,
 * `prayer.dart` default status). Nothing invented.
 */

/** Infinite-list page size (Flutter `PrayersNotifier._pageSize = 50`). */
export const PRAYER_PAGE_SIZE = 50;

/** Title validators (Flutter `AddEditPrayerSheet` title field). */
export const PRAYER_TITLE_MIN_LENGTH = 3;
export const PRAYER_TITLE_MAX_LENGTH = 100;

/** Details validators (Flutter `AddEditPrayerSheet` details field). */
export const PRAYER_DETAILS_MIN_LENGTH = 10;
export const PRAYER_DETAILS_MAX_LENGTH = 1000;

/** The default `prayers.status` (Flutter `Prayer.fromJson` default `'active'`). */
export const PRAYER_DEFAULT_STATUS = "active";
