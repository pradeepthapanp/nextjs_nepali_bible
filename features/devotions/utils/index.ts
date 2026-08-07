/**
 * Barrel for the Devotions pure utils.
 *
 *   day-of-year.ts  getDayOfYear (the repository's "today" computation)
 *   date.ts         formatDevotionDate (Flutter `DateFormat('EEEE, MMMM d, yyyy')`)
 *   bible-link.ts   parseDevotionBibleLink (B: links — the URL uses the EXISTING bible `buildBibleUrl`)
 *   deep-link.ts    buildDevotionUrl / parseDevotionPath
 *   plain-text.ts   devotionToPlainText (the share text — Flutter shareHtmlContent)
 */

export * from "./day-of-year";
export * from "./date";
export * from "./bible-link";
export * from "./deep-link";
export * from "./plain-text";
