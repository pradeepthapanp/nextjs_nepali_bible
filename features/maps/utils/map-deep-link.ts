import type { MapDeepLink } from "../types";

/**
 * Maps deep-link helpers — the ONLY place Maps URLs are built and parsed
 * (mirrors `buildArticleUrl`/`parseArticlePath`). Web-first adaptations:
 *
 *   /maps                      → topics page
 *   /maps/topic/{topic}        → maps list (topic URL-ENCODED — real topics
 *                                contain spaces/dashes/question marks)
 *   /maps/view/{mapId}         → full-screen viewer (web-first route; Flutter
 *                                pushed the object via `Navigator.push`)
 *
 * `parseMapPath` uses `decodeURIComponent` on the topic segment so both an
 * encoded pathname (the URL form) and an already-decoded one resolve to the
 * same topic.
 */
export function buildMapUrl(link: MapDeepLink): string {
  switch (link.kind) {
    case "topics":
      return "/maps";
    case "list":
      return `/maps/topic/${encodeURIComponent(link.topic)}`;
    case "view":
      return `/maps/view/${link.mapId}`;
  }
}

/**
 * Parses a `/maps` pathname into a typed deep link, or null off-section.
 * Unknown `/maps/...` shapes fall back to the topics link (like the
 * Articles/Bible parsers).
 */
export function parseMapPath(pathname: string): MapDeepLink | null {
  if (!pathname.startsWith("/maps")) return null;
  if (pathname === "/maps" || pathname === "/maps/") return { kind: "topics" };
  const list = pathname.match(/^\/maps\/topic\/(.+)$/);
  if (list) return { kind: "list", topic: decodeURIComponent(list[1]) };
  const view = pathname.match(/^\/maps\/view\/([^/]+)$/);
  if (view) return { kind: "view", mapId: view[1] };
  return { kind: "topics" };
}
