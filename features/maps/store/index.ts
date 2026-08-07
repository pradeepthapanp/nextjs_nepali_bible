/**
 * Barrel for the Maps Zustand stores.
 *
 *   map-viewer-store.ts   useMapViewerStore — transient viewer zoom/pan/
 *                         fullscreen (NOT persisted; no server data).
 *
 * Deliberately the ONLY store: search is page-local hook state (matching
 * Flutter's `_searchController`), and the 3 routes are URL-driven so no
 * navigation store is needed.
 */

export * from "./map-viewer-store";
