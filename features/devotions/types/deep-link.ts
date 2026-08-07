/**
 * Devotion deep-link types — the typed navigation targets for the Devotions
 * sub-feature (the counterparts to `AuthDeepLink` / `MapDeepLink` /
 * `CommunityDeepLink`).
 *
 *   devotion → /devotion
 *
 * Flutter exposes exactly ONE devotion route (`AppRoutes.devotion = '/devotion'`,
 * inside the Bible shell, PUBLIC — no `AuthStatePage` wrapper). The web keeps
 * the same single route — no catch-all, no dispatcher required.
 *
 * `DevotionBibleReference` is the parsed `B:<book> <chapter>:<verse>` link
 * target (Flutter `TodaysDevotionPage._parseBibleLink` → a `Ver`). It is a
 * navigation target, so it lives with the deep-link types.
 */
export type DevotionDeepLink = {
  kind: "devotion";
};

/** A bible reference parsed from a devotion `B:` link (Flutter `_parseBibleLink`). */
export interface DevotionBibleReference {
  bookNumber: number;
  chapter: number;
  verse: number;
}
