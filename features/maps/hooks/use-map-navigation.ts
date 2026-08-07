"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { MapTopic } from "../types";
import { buildMapUrl, parseMapPath } from "../utils";

/**
 * useMapNavigation — the deep-link + navigation behavior for the Maps section
 * (the counterpart to `useArticleNavigation` / `useMusicDeepLink`).
 *
 * COMPOSES the Next router + the pure `buildMapUrl` / `parseMapPath` helpers
 * (the single URL source in `utils/map-deep-link`). Each page reads its own
 * deep link via `currentLink`, so browser Back/Forward, refresh and shared
 * deep links all work — the URL is the source of truth.
 */
export function useMapNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  /** The parsed deep link of the current path (or null off `/maps`). */
  const currentLink = useMemo(() => parseMapPath(pathname), [pathname]);

  /** Open the topics page (`/maps`). */
  const openTopics = useCallback(() => router.push(buildMapUrl({ kind: "topics" })), [router]);

  /** Open a topic's maps list (`/maps/topic/{encoded topic}`). */
  const openTopic = useCallback(
    (topic: MapTopic) => router.push(buildMapUrl({ kind: "list", topic })),
    [router],
  );

  /** Open the full-screen map viewer (`/maps/view/{id}`). */
  const openMap = useCallback(
    (mapId: string) => router.push(buildMapUrl({ kind: "view", mapId })),
    [router],
  );

  /** Go back (used by the list/viewer close buttons). */
  const back = useCallback(() => router.back(), [router]);

  return {
    currentLink,
    openTopics,
    openTopic,
    openMap,
    back,
  };
}
