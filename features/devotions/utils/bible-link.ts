/**
 * Devotion bible-link helpers — the `B:<book> <chapter>:<verse>` links inside
 * the devotion HTML.
 *
 * Flutter `TodaysDevotionPage._parseBibleLink`:
 *   `RegExp(r'^B:(\d+)\s+(\d+):(\d+)(?:-\d+)?$')` → a `Ver` → the
 *   `ReferenceVersesSheet`. On the web the devotion NAVIGATES to the passage
 *   instead (the Bible feature's `goTo` precedent — bottom sheet becomes a
 *   navigation) using the EXISTING `buildBibleUrl` deep-link helper
 *   (`@features/bible/utils/deep-link`, reused by `useDevotionNavigation`) —
 *   NO bible URL logic is duplicated.
 *
 * This module only PARSES the devotion `B:` links (the devotion-specific part);
 * the URL building is delegated to the existing Bible helper.
 */

import type { DevotionBibleReference } from "../types";

/** The Flutter `_parseBibleLink` pattern (`B:1 1:1` or `B:1 1:1-5`). */
const BIBLE_LINK_PATTERN = /^B:(\d+)\s+(\d+):(\d+)(?:-\d+)?$/;

/** Parses a devotion `B:` link into a reference, or null when it does not match. */
export function parseDevotionBibleLink(
  link: string,
): DevotionBibleReference | null {
  const match = BIBLE_LINK_PATTERN.exec(link.trim());
  if (!match) return null;
  return {
    bookNumber: Number(match[1]),
    chapter: Number(match[2]),
    verse: Number(match[3]),
  };
}
