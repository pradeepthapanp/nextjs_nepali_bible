import { Suspense } from "react";
import { MapRouteDispatcher } from "@/features/maps/pages/map-route-dispatcher";

/**
 * Maps route — the mount point for the Maps section.
 *
 * A single optional catch-all covers every deep-link shape handled by
 * `parseMapPath`:
 *   /maps                    → topics
 *   /maps/topic/{topic}      → maps list (topic URL-encoded)
 *   /maps/view/{mapId}       → full-screen viewer
 * `MapRouteDispatcher` picks the page from the path; each page reads its own
 * params/data, so this page stays a thin server shell. `Suspense` keeps the
 * dispatcher safe for prerendered client rendering (mirrors the Articles /
 * Music routes).
 */
export default function MapsPage() {
  return (
    <Suspense fallback={null}>
      <MapRouteDispatcher />
    </Suspense>
  );
}
