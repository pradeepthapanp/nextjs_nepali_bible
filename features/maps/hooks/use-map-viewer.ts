"use client";

import { useMapViewerStore } from "../store";
import { useMap } from "../queries";

/**
 * useMapViewer — the full-screen map viewer behavior (the web equivalent of
 * `BibleMapImageViewer`'s data + `TransformationController` in
 * `map_image_viewer.dart`).
 *
 * COMPOSES:
 * - `useMap(mapId)` (React Query) — the map resolved by id (deep-link /
 *   refresh-safe; the Flutter app pushed the whole object instead);
 * - `useMapViewerStore` (Zustand) — the TRANSIENT zoom/pan/fullscreen state +
 *   its actions (no server data lives here).
 *
 * The gesture engine (pointer/wheel/double-tap → store actions) lives in the
 * `MapImageViewer` component; this hook only exposes the map query + the
 * viewer state surface to the page.
 */
export function useMapViewer(mapId?: string) {
  const mapQuery = useMap(mapId);
  const {
    scale,
    x,
    y,
    isFullscreen,
    zoomIn,
    zoomOut,
    zoomTo,
    doubleTap,
    setPan,
    reset,
    setFullscreen,
  } = useMapViewerStore();

  return {
    map: mapQuery.data,
    isLoading: mapQuery.isLoading,
    isError: mapQuery.isError,
    error: mapQuery.error,
    refetch: () => void mapQuery.refetch(),
    // Viewer UI state + actions (from the transient store).
    scale,
    x,
    y,
    isFullscreen,
    zoomIn,
    zoomOut,
    zoomTo,
    doubleTap,
    setPan,
    reset,
    setFullscreen,
  };
}
