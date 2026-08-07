"use client";

import { useEffect, useRef, useState } from "react";
import { ImageOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAP_VIEWER_MAX_SCALE, MAP_VIEWER_MIN_SCALE } from "../constants";
import { useMapViewerStore } from "../store";
import type { BibleMap } from "../types";
import { cn } from "@/utils/cn";

export interface MapImageViewerProps {
  map: BibleMap;
  className?: string;
}

interface GestureState {
  mode: "pan" | "pinch" | null;
  startPointerX: number;
  startPointerY: number;
  startPanX: number;
  startPanY: number;
  startScale: number;
  startDist: number;
  startMidX: number;
  startMidY: number;
}

const clampScale = (scale: number) =>
  Math.min(MAP_VIEWER_MAX_SCALE, Math.max(MAP_VIEWER_MIN_SCALE, scale));

/** Keeps the panned image within the container bounds (boundary constraint). */
function clampPan(
  nx: number,
  ny: number,
  width: number,
  height: number,
  scale: number,
): { x: number; y: number } {
  const maxX = Math.max(0, (width / 2) * (scale - 1));
  const maxY = Math.max(0, (height / 2) * (scale - 1));
  return {
    x: Math.min(maxX, Math.max(-maxX, nx)),
    y: Math.min(maxY, Math.max(-maxY, ny)),
  };
}

/**
 * MapImageViewer — the full-screen map viewer (the web replacement of
 * `BibleMapImageViewer`'s `InteractiveViewer` + `CachedNetworkImage` in
 * `map_image_viewer.dart`). A CUSTOM pan/zoom engine (no third-party library —
 * the Flutter behavior is recreated with pointer events + a CSS transform):
 *
 *   - zoom in / zoom out        (toolbar + keyboard +/- + mouse wheel)
 *   - double-click / double-tap (1 ↔ MAP_VIEWER_DOUBLE_TAP_SCALE — the
 *                                browser fires `dblclick` for double-taps)
 *   - mouse wheel zoom          (zoom-to-cursor, native listener passive:false)
 *   - drag to pan               (pointer events, pointer capture)
 *   - pinch zoom (touch)        (two-pointer distance + midpoint)
 *   - reset view / fit-to-screen (scale 1, pan 0)
 *   - fullscreen                (requestFullscreen when the browser supports it)
 *
 * The zoom/pan/fullscreen STATE lives in `useMapViewerStore` (shared with
 * `MapToolbar`); the image-load lifecycle (`loading | loaded | error`) is
 * local here. Presentational over the store — no server data, no Supabase.
 */
export function MapImageViewer({ map, className }: MapImageViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [imageStatus, setImageStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  );
  const [imageSrc, setImageSrc] = useState(map.imageUrl);

  const scale = useMapViewerStore((s) => s.scale);
  const x = useMapViewerStore((s) => s.x);
  const y = useMapViewerStore((s) => s.y);
  const zoomTo = useMapViewerStore((s) => s.zoomTo);
  const doubleTap = useMapViewerStore((s) => s.doubleTap);
  const setPan = useMapViewerStore((s) => s.setPan);

  // Gesture bookkeeping (refs — never re-render on pointer moves).
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const gestureRef = useRef<GestureState>({
    mode: null,
    startPointerX: 0,
    startPointerY: 0,
    startPanX: 0,
    startPanY: 0,
    startScale: 1,
    startDist: 0,
    startMidX: 0,
    startMidY: 0,
  });

  const beginPan = (x: number, y: number) => {
    const s = useMapViewerStore.getState();
    gestureRef.current = {
      ...gestureRef.current,
      mode: "pan",
      startPointerX: x,
      startPointerY: y,
      startPanX: s.x,
      startPanY: s.y,
      startScale: s.scale,
    };
  };

  const beginPinch = () => {
    const [p1, p2] = [...pointersRef.current.values()];
    const s = useMapViewerStore.getState();
    const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
    gestureRef.current = {
      mode: "pinch",
      startPointerX: 0,
      startPointerY: 0,
      startPanX: s.x,
      startPanY: s.y,
      startScale: s.scale,
      startDist: dist,
      startMidX: (p1.x + p2.x) / 2,
      startMidY: (p1.y + p2.y) / 2,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Synthetic/untrusted pointer events may not have a capture-able pointer.
    }
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersRef.current.size === 1) {
      beginPan(e.clientX, e.clientY);
    } else if (pointersRef.current.size === 2) {
      beginPinch();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const pointer = pointersRef.current.get(e.pointerId);
    if (!pointer) return;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const g = gestureRef.current;
    const st = useMapViewerStore.getState();

    if (g.mode === "pan" && pointersRef.current.size === 1) {
      const dx = e.clientX - g.startPointerX;
      const dy = e.clientY - g.startPointerY;
      const clamped = clampPan(
        g.startPanX + dx,
        g.startPanY + dy,
        rect.width,
        rect.height,
        st.scale,
      );
      setPan(clamped.x, clamped.y);
    } else if (g.mode === "pinch" && pointersRef.current.size >= 2) {
      const [p1, p2] = [...pointersRef.current.values()];
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      const nextScale = clampScale(g.startScale * (dist / g.startDist));
      const dxMid = midX - g.startMidX;
      const dyMid = midY - g.startMidY;
      const clamped = clampPan(
        g.startPanX + dxMid,
        g.startPanY + dyMid,
        rect.width,
        rect.height,
        nextScale,
      );
      zoomTo(nextScale);
      setPan(clamped.x, clamped.y);
    }
  };

  const endPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);
    const s = useMapViewerStore.getState();
    if (pointersRef.current.size === 1) {
      const [p] = [...pointersRef.current.values()];
      beginPan(p.x, p.y);
    } else if (pointersRef.current.size === 0) {
      gestureRef.current.mode = null;
    }
    void s; // (getState read keeps the closure fresh for the next gesture)
  };

  // Mouse-wheel zoom (native listener with passive:false so preventDefault works).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const st = useMapViewerStore.getState();
      const factor = e.deltaY < 0 ? 1.25 : 0.8;
      const nextScale = clampScale(st.scale * factor);
      if (nextScale === st.scale) return;
      // Zoom to cursor: keep the content point under the pointer stationary.
      const coX = e.clientX - rect.left - rect.width / 2;
      const coY = e.clientY - rect.top - rect.height / 2;
      const ratio = nextScale / st.scale;
      const nx = coX - (coX - st.x) * ratio;
      const ny = coY - (coY - st.y) * ratio;
      const clamped = clampPan(nx, ny, rect.width, rect.height, nextScale);
      zoomTo(nextScale);
      setPan(clamped.x, clamped.y);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomTo, setPan]);

  // Keyboard shortcuts: + / = zoom in, - zoom out, 0 reset, f fullscreen.
  // (The 'f' toggle sets the SHARED store flag; the PAGE owns the DOM
  // fullscreen effect so the header + toolbar stay visible.)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      const st = useMapViewerStore.getState();
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        st.zoomIn();
      } else if (e.key === "-") {
        e.preventDefault();
        st.zoomOut();
      } else if (e.key === "0") {
        e.preventDefault();
        st.reset();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        st.setFullscreen(!st.isFullscreen);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const retry = () => {
    setImageSrc(`${map.imageUrl}${map.imageUrl.includes("?") ? "&" : "?"}t=${Date.now()}`);
    setImageStatus("loading");
  };

  const openInBrowser = () => {
    window.open(map.imageUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full w-full touch-none select-none overflow-hidden bg-black",
        className,
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onDoubleClick={doubleTap}
    >
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${x}px, ${y}px) scale(${scale})`,
          transformOrigin: "center center",
          cursor: imageStatus === "loaded" ? "grab" : "default",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={map.title}
          draggable={false}
          className="h-full w-full object-contain"
          onLoad={() => setImageStatus("loaded")}
          onError={() => setImageStatus("error")}
        />
      </div>

      {imageStatus === "loading" ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <Loader2 className="size-8 animate-spin text-white" aria-hidden />
        </div>
      ) : null}

      {imageStatus === "error" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
          <ImageOff className="size-12 text-white/60" aria-hidden />
          <p className="text-sm text-white/70">Failed to load image</p>
          <Button type="button" variant="secondary" onClick={retry}>
            Retry
          </Button>
          <Button type="button" variant="ghost" onClick={openInBrowser}>
            Open in Browser Instead
          </Button>
        </div>
      ) : null}
    </div>
  );
}
