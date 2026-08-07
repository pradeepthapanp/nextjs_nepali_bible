# Maps — Zustand layer (implemented)

The Maps Zustand stores are implemented. Following the "only persist what
survives restarts / do not persist temporary UI state" convention, there is
exactly ONE store, and it is deliberately NOT persisted.

## `useMapViewerStore` (implemented — `map-viewer-store.ts`)

The full-screen map viewer's TRANSIENT UI state (the web equivalent of
Flutter's `_BibleMapImageViewerState` `TransformationController`):

```ts
interface MapViewerStore {
  scale: number;         // current zoom (clamped MAP_VIEWER_MIN/MAX_SCALE)
  x: number;             // pan offset (screen px)
  y: number;
  isFullscreen: boolean;
  zoomIn(): void;        // ×1.25 (clamped)
  zoomOut(): void;       // ÷1.25 (clamped)
  zoomTo(scale): void;   // absolute scale (clamped) — wheel/pinch/double-tap
  doubleTap(): void;     // 1 ↔ MAP_VIEWER_DOUBLE_TAP_SCALE
  setPan(x, y): void;    // the gesture code clamps to container bounds first
  reset(): void;         // scale 1, pan 0,0 (also fit-to-screen)
  setFullscreen(b): void;
}
```

- NOT persisted (a restart opens the map fresh, like Flutter).
- NO server data — the map stays in the React Query cache (`mapKeys.detail`).
- The PAGE owns the DOM fullscreen effect (so the header + toolbar stay
  visible) and resets the store on mount (a module singleton would otherwise
  carry stale zoom/fullscreen between viewer visits).

## Deliberately NOT a store

- **Search is page-local hook state** (`useMapSearch` uses `useState`), exactly
  like Flutter's `_searchController` — no search store (the user's "only if
  actually needed").
- **No navigation store** — the three routes are simple + URL-driven
  (`buildMapUrl`/`parseMapPath`), so a pending-target store would be dead
  architecture.
