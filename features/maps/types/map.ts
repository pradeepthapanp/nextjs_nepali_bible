/**
 * Maps domain types — a direct port of the Flutter Maps models
 * (`lib/models/bible_map.dart` + the `bible_maps` table + the
 * `get_bible_map_topics` RPC). Verified against the real backend.
 *
 * No `MapCategory` type exists: in Flutter the TOPIC is the grouping (there is
 * no separate category table or model) — the maps list is grouped by a
 * free-text `topic` string, and the topics page renders those strings directly.
 */

/**
 * BibleMap — a direct port of the Flutter `BibleMap` model
 * (`lib/models/bible_map.dart`, Supabase `bible_maps` table).
 *
 * Column mapping (snake_case → camelCase):
 *   id, topic, title, image_url → imageUrl, created_at → createdAt.
 *
 * `imageUrl` is a FULL media URL (e.g. `https://media.sgmbiblezone.com/maps/…`)
 * — the DB stores absolute URLs, so no path construction / `mediaPathFromUrl`
 * is needed (maps are read-only content; there is no upload/delete).
 */
export interface BibleMap {
  id: string;
  /** Free-text grouping (e.g. "Net Bible Maps"); NOT a foreign key. */
  topic: MapTopic;
  /** Display title — often prefixed with a number, e.g. "251. The Church #1". */
  title: string;
  /** Full image URL (media CDN). */
  imageUrl: string;
  /** ISO timestamp. */
  createdAt: string;
}

/**
 * MapTopic — a distinct map topic. In Flutter this is a plain `String`
 * (the `get_bible_map_topics` RPC returns `[{ topic: string }]` rows that the
 * repository maps to strings). Kept as a branded type alias so the domain
 * reads `MapTopic` everywhere without inventing a table/model.
 */
export type MapTopic = string;

/**
 * MapDeepLink — the typed navigation target for the Maps section
 * (the counterpart to the Music `MusicDeepLink` / Articles `ArticleRouteLink`).
 *
 *   topics → /maps
 *   list   → /maps/topic/{topic}   (topic URL-encoded — contains spaces/dashes)
 *   view   → /maps/view/{mapId}
 *
 * `{kind:"view"}` is a WEB-FIRST shape: Flutter pushes `BibleMapImageViewer`
 * with the whole `BibleMap` object via `Navigator.push` (no URL), which cannot
 * be deep-linked/refresh-safe on the web — so the viewer becomes a URL route
 * resolved by map id (see the services README's web-first `getMapById`).
 */
export type MapDeepLink =
  | { kind: "topics" }
  | { kind: "list"; topic: MapTopic }
  | { kind: "view"; mapId: string };

/**
 * MapViewerState — the full-screen map viewer's TRANSIENT state (the web
 * equivalent of the Flutter `_BibleMapImageViewerState` fields: the
 * `TransformationController` transform + the image load lifecycle).
 *
 * This is COMPONENT-LOCAL UI state (not a Zustand store — it must not survive
 * a restart and is not shared across pages, per the "do not persist temporary
 * dialog/UI state" convention). The map itself is server data owned by React
 * Query (`mapKeys.detail(id)`).
 */
export interface MapViewerState {
  /** Current zoom scale (1 = fit; 2 = double-tap zoom). */
  scale: number;
  /** Image load lifecycle (mirrors `CachedNetworkImage` progress/error). */
  imageStatus: "loading" | "loaded" | "error";
}
