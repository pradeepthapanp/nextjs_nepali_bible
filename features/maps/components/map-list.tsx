"use client";

import { ListX } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import type { BibleMap } from "../types";
import { MapCard } from "./map-card";
import { cn } from "@/utils/cn";

export interface MapListProps {
  /** The maps to render (already client-side filtered by the caller). */
  maps: BibleMap[];
  /** The total unfiltered count (for the "Showing X of Y" hint). */
  total: number;
  /** The active search query (drives the empty-state message + the hint). */
  searchQuery?: string;
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
  onOpen?: (map: BibleMap) => void;
  className?: string;
}

/**
 * MapList — a topic's maps list (the web replacement of the `ListView.builder`
 * + empty/error states in `MapsDetailView`). Presentational: renders the
 * shared states + the "Showing X of Y results" hint (faithful to Flutter) +
 * the `MapCard`s. The maps are ALREADY client-side filtered by the caller
 * (the page composes `useMapSearch`) — no search logic here.
 */
export function MapList({
  maps,
  total,
  searchQuery = "",
  isLoading,
  isError,
  onRetry,
  onOpen,
  className,
}: MapListProps) {
  if (isLoading) return <LoadingState label="Loading titles…" />;
  if (isError) {
    return (
      <ErrorState
        title="Error loading titles"
        description="Something went wrong while loading the maps."
        onRetry={onRetry}
      />
    );
  }
  if (maps.length === 0) {
    return (
      <EmptyState
        icon={ListX}
        title={searchQuery.trim() ? "No results" : "No items found"}
        description={
          searchQuery.trim()
            ? `No results for "${searchQuery.trim()}"`
            : "This topic has no maps yet."
        }
      />
    );
  }

  const searching = searchQuery.trim().length > 0;

  return (
    <div className={cn("space-y-2", className)}>
      {searching && maps.length !== total ? (
        <p className="px-1 text-xs text-primary">
          Showing {maps.length} of {total} results
        </p>
      ) : null}
      <div className="grid gap-2 sm:grid-cols-2">
        {maps.map((map) => (
          <MapCard key={map.id} map={map} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}
