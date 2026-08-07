"use client";

import { create } from "zustand";
import {
  MAP_VIEWER_DOUBLE_TAP_SCALE,
  MAP_VIEWER_MAX_SCALE,
  MAP_VIEWER_MIN_SCALE,
} from "../constants";

/**
 * Map viewer store — the full-screen map viewer's TRANSIENT UI state (zoom,
 * pan and fullscreen), the web equivalent of Flutter's
 * `_BibleMapImageViewerState` `TransformationController` + the
 * `InteractiveViewer` transform.
 *
 * UI state only, deliberately NOT persisted (a restart must open the map
 * fresh, like Flutter) and NO server data — the map itself stays in the React
 * Query cache (`mapKeys.detail(id)`).
 *
 * Scale is clamped to `MAP_VIEWER_MIN_SCALE..MAP_VIEWER_MAX_SCALE` (Flutter
 * `InteractiveViewer` minScale 0.5 / maxScale 5). Pan offsets (x/y) are in
 * screen px (transform-origin center); the gesture code in `MapImageViewer`
 * clamps them to the container bounds before calling `setPan`.
 */
const clampScale = (scale: number) =>
  Math.min(MAP_VIEWER_MAX_SCALE, Math.max(MAP_VIEWER_MIN_SCALE, scale));

/** Default zoom-in/out factor for the toolbar + wheel (per step). */
const ZOOM_STEP = 1.25;

export interface MapViewerStore {
  /** Current zoom scale (1 = fit-to-screen). */
  scale: number;
  /** Horizontal pan offset (screen px). */
  x: number;
  /** Vertical pan offset (screen px). */
  y: number;
  /** Whether the viewer container is in browser fullscreen. */
  isFullscreen: boolean;
  /** Zoom in by one step (clamped). */
  zoomIn: () => void;
  /** Zoom out by one step (clamped). */
  zoomOut: () => void;
  /** Zoom to an absolute scale (clamped) — used by wheel/pinch/double-tap. */
  zoomTo: (scale: number) => void;
  /** Double-tap/double-click: toggle 1 ↔ MAP_VIEWER_DOUBLE_TAP_SCALE. */
  doubleTap: () => void;
  /** Set the pan offset (the gesture code clamps before calling). */
  setPan: (x: number, y: number) => void;
  /** Reset the view (scale 1, pan 0,0) — also the fit-to-screen action. */
  reset: () => void;
  /** Set the fullscreen flag (the viewer applies/removes the DOM fullscreen). */
  setFullscreen: (isFullscreen: boolean) => void;
}

/** Transient map-viewer UI state (zoom/pan/fullscreen). */
export const useMapViewerStore = create<MapViewerStore>()((set) => ({
  scale: 1,
  x: 0,
  y: 0,
  isFullscreen: false,
  zoomIn: () => set((s) => ({ scale: clampScale(s.scale * ZOOM_STEP) })),
  zoomOut: () => set((s) => ({ scale: clampScale(s.scale / ZOOM_STEP) })),
  zoomTo: (scale) => set((s) => ({ ...s, scale: clampScale(scale) })),
  doubleTap: () =>
    set((s) =>
      s.scale > 1
        ? { scale: 1, x: 0, y: 0 }
        : { ...s, scale: MAP_VIEWER_DOUBLE_TAP_SCALE },
    ),
  setPan: (x, y) => set({ x, y }),
  reset: () => set({ scale: 1, x: 0, y: 0 }),
  setFullscreen: (isFullscreen) => set({ isFullscreen }),
}));
