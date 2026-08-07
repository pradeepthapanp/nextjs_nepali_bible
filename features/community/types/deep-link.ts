/**
 * Community deep-link types — the typed navigation targets for the two
 * sub-features (the counterparts to `MapDeepLink` / `AuthDeepLink`).
 *
 *   prayers:
 *     prayers      → /prayers
 *     prayer       → /prayers/{id}
 *     prayerNew    → /prayers/new
 *     prayerEdit   → /prayers/edit/{id}
 *   notices:
 *     notices      → /notices
 *     notice       → /notices/{id}
 *     noticeNew    → /notices/new
 *     noticeEdit   → /notices/edit/{id}
 *
 * The web SPLITS Flutter's single `CommunityPage` tab container (`/prayers` +
 * `/notices` both render it) into separate list/detail/new/edit routes per the
 * user's explicit deep-link model. All routes are SIGNED-IN (Flutter wraps
 * them in `AuthStatePage` → the web wraps them in the shared `AuthGate`).
 */
export type PrayerDeepLink =
  | { kind: "prayers" }
  | { kind: "prayer"; id: string }
  | { kind: "prayerNew" }
  | { kind: "prayerEdit"; id: string };

export type NoticeDeepLink =
  | { kind: "notices" }
  | { kind: "notice"; id: string }
  | { kind: "noticeNew" }
  | { kind: "noticeEdit"; id: string };

/** Union of every community deep link (for the pending-target navigation store). */
export type CommunityDeepLink = PrayerDeepLink | NoticeDeepLink;
