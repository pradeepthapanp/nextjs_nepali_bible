"use client";

import {
  Maximize,
  Minimize,
  Minus,
  Plus,
  Scan,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMapViewerStore } from "../store";
import { cn } from "@/utils/cn";

export interface MapToolbarProps {
  className?: string;
}

/**
 * MapToolbar — the full-screen map viewer's zoom/control bar (a web
 * refinement; Flutter's `BibleMapImageViewer` has no on-screen zoom buttons —
 * only gestures). Composes `useMapViewerStore` directly (the SAME store the
 * `MapImageViewer` gestures use), so the buttons are always in sync with the
 * image transform:
 *
 *   + / −      zoom in / out (clamped to MAP_VIEWER_MIN/MAX_SCALE)
 *   Fit        fit-to-screen (reset: scale 1, pan 0 — the image is contain-fit)
 *   Fullscreen toggles the browser fullscreen (when supported)
 *
 * Presentational over the store — no zoom math is duplicated here.
 */
export function MapToolbar({ className }: MapToolbarProps) {
  const scale = useMapViewerStore((s) => s.scale);
  const isFullscreen = useMapViewerStore((s) => s.isFullscreen);
  const zoomIn = useMapViewerStore((s) => s.zoomIn);
  const zoomOut = useMapViewerStore((s) => s.zoomOut);
  const reset = useMapViewerStore((s) => s.reset);
  const setFullscreen = useMapViewerStore((s) => s.setFullscreen);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1 rounded-xl border bg-background/90 px-2 py-1.5 shadow-lg backdrop-blur",
        className,
      )}
    >
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label="Zoom out"
        onClick={zoomOut}
      >
        <Minus aria-hidden />
      </Button>
      <span
        className="min-w-12 text-center text-sm font-medium tabular-nums text-foreground"
        aria-live="polite"
      >
        {Math.round(scale * 100)}%
      </span>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label="Zoom in"
        onClick={zoomIn}
      >
        <Plus aria-hidden />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label="Fit to screen"
        onClick={reset}
      >
        <Scan aria-hidden />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label="Reset view"
        onClick={reset}
      >
        <ZoomOut aria-hidden />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        aria-pressed={isFullscreen}
        onClick={() => setFullscreen(!isFullscreen)}
      >
        {isFullscreen ? <Minimize aria-hidden /> : <Maximize aria-hidden />}
      </Button>
    </div>
  );
}
