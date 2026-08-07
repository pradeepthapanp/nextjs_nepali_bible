"use client";

import { useEffect, useRef, useState } from "react";
import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useMapNavigation, useMapViewer } from "../hooks";
import { useMapViewerStore } from "../store";
import {
  MapImageViewer,
  MapInfoDialog,
  MapToolbar,
} from "../components";
import { cleanMapTitle } from "../utils";

export interface MapViewerPageProps {
  /** The map id from `/maps/view/{id}` (deep-link / refresh-safe). */
  mapId: string;
}

/**
 * MapViewerPage — the page-level orchestration for the full-screen map viewer
 * (the web replacement of `BibleMapImageViewer` in `map_image_viewer.dart`):
 * the map-by-id query (loading/error/empty states), the black full-screen
 * shell with a close/info header, the pan/zoom `MapImageViewer`, the
 * `MapToolbar` and the `MapInfoDialog`.
 *
 * Composes ONLY behavior/query hooks + reusable components:
 *   - `useMapViewer(mapId)` — the map query (React Query) + the transient
 *     viewer state (Zustand `useMapViewerStore` zoom/pan/fullscreen);
 *   - `useMapNavigation` — `back` (close) deep link.
 * The page OWNS the DOM fullscreen effect (the store flag is shared) so the
 * header + toolbar stay visible in fullscreen. No Supabase, no duplicated
 * zoom/image logic.
 */
export function MapViewerPage({ mapId }: MapViewerPageProps) {
  const {
    map,
    isLoading,
    isError,
    error,
    refetch,
  } = useMapViewer(mapId);
  const { back } = useMapNavigation();
  const [infoOpen, setInfoOpen] = useState(false);

  // Browser fullscreen: apply/remove DOM fullscreen on the page container when
  // the shared store flag changes (the viewer + toolbar + header all live here,
  // so they remain visible in fullscreen).
  const pageRef = useRef<HTMLDivElement | null>(null);
  const isFullscreen = useMapViewerStore((s) => s.isFullscreen);
  const setFullscreen = useMapViewerStore((s) => s.setFullscreen);

  // Start each viewer mount fresh: the store is a module singleton, so a
  // stale zoom/fullscreen from a previous viewer visit must not carry over
  // (Flutter creates a fresh `TransformationController` per viewer instance).
  useEffect(() => {
    const state = useMapViewerStore.getState();
    state.reset();
    state.setFullscreen(false);
  }, []);

  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    if (isFullscreen && !document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => setFullscreen(false));
    } else if (!isFullscreen && document.fullscreenElement === el) {
      void document.exitFullscreen?.().catch(() => undefined);
    }
  }, [isFullscreen, setFullscreen]);
  useEffect(() => {
    const onChange = () =>
      setFullscreen(document.fullscreenElement === pageRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [setFullscreen]);

  let body: React.ReactNode;
  if (isLoading) {
    body = <LoadingState label="Loading map…" />;
  } else if (isError) {
    body = (
      <ErrorState
        title="Unable to load map"
        description={error instanceof Error ? error.message : "Something went wrong."}
        onRetry={() => void refetch()}
      />
    );
  } else if (!map) {
    body = (
      <EmptyState
        icon={Info}
        title="Map not found"
        description="This map may have been removed."
      />
    );
  } else {
    body = (
      <>
        <MapImageViewer key={map.id} map={map} className="absolute inset-0" />
        <MapToolbar className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2" />
        <MapInfoDialog map={map} open={infoOpen} onOpenChange={setInfoOpen} />
      </>
    );
  }

  return (
    <div
      ref={pageRef}
      className="relative h-dvh w-full overflow-hidden bg-black text-white"
    >
      <header className="absolute inset-x-0 top-0 z-20 flex items-center gap-2 bg-gradient-to-b from-black/70 to-transparent px-3 py-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          aria-label="Close map viewer"
          onClick={back}
        >
          <X aria-hidden />
        </Button>
        <h1 className="min-w-0 flex-1 truncate text-base font-semibold">
          {map ? cleanMapTitle(map.title) : "Map"}
        </h1>
        {map ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            aria-label="Image information"
            onClick={() => setInfoOpen(true)}
          >
            <Info aria-hidden />
          </Button>
        ) : null}
      </header>

      {body}
    </div>
  );
}
