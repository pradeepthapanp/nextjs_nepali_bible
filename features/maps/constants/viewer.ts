/**
 * Maps constants — the small set of tuning values extracted from the Flutter
 * implementation (nothing invented). Maps is a read-only feature with no
 * pagination, no category list, no editor tuning, so there are deliberately
 * few constants.
 *
 *   viewer.ts   the full-screen viewer's pan/zoom limits + double-tap zoom
 *               (faithful ports of `BibleMapImageViewer`'s InteractiveViewer
 *               config + `_handleDoubleTap` scale).
 */

/** Minimum zoom of the map image viewer (Flutter `InteractiveViewer.minScale`). */
export const MAP_VIEWER_MIN_SCALE = 0.5;

/** Maximum zoom of the map image viewer (Flutter `InteractiveViewer.maxScale`). */
export const MAP_VIEWER_MAX_SCALE = 5;

/** Double-tap zoom toggle scale (Flutter `_handleDoubleTap`: 1 ↔ 2). */
export const MAP_VIEWER_DOUBLE_TAP_SCALE = 2;
