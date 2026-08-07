"use client";

import { useMapNavigation } from "../hooks";
import { MapViewerPage } from "./map-viewer-page";
import { MapsListPage } from "./maps-list-page";
import { MapsTopicsPage } from "./maps-topics-page";

/**
 * MapRouteDispatcher — route-level dispatch for the `/maps` catch-all
 * (the counterpart to the Articles/Bible/Music route dispatchers).
 *
 * Supported deep-link shapes (parsed by `parseMapPath`):
 *   /maps                  → MapsTopicsPage
 *   /maps/topic/{topic}    → MapsListPage (topic URL-decoded)
 *   /maps/view/{mapId}     → MapViewerPage
 *
 * Each page receives its resolved id/topic via props (the URL is the source
 * of truth, so browser Back/Forward, refresh and shared deep links work).
 */
export function MapRouteDispatcher() {
  const { currentLink } = useMapNavigation();

  if (currentLink?.kind === "list") {
    return <MapsListPage topic={currentLink.topic} />;
  }
  if (currentLink?.kind === "view") {
    return <MapViewerPage mapId={currentLink.mapId} />;
  }
  return <MapsTopicsPage />;
}
