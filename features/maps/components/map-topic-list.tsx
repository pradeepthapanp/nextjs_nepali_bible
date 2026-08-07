"use client";

import { Map as MapIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import type { MapTopic } from "../types";
import { MapTopicCard } from "./map-topic-card";
import { cn } from "@/utils/cn";

export interface MapTopicListProps {
  topics: MapTopic[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
  onOpen?: (topic: MapTopic) => void;
  className?: string;
}

/**
 * MapTopicList — the topics list surface (the web replacement of the
 * `ListView.builder` + loading/error states in `BibleMapsView`). Presentational:
 * it renders the shared LoadingState / ErrorState / EmptyState + the
 * `MapTopicCard`s. Data + handlers come via props (the page composes
 * `useMapTopics`).
 */
export function MapTopicList({
  topics,
  isLoading,
  isError,
  onRetry,
  onOpen,
  className,
}: MapTopicListProps) {
  if (isLoading) return <LoadingState label="Loading maps…" />;
  if (isError) {
    return (
      <ErrorState
        title="Unable to load maps"
        description="Something went wrong while loading the maps."
        onRetry={onRetry}
      />
    );
  }
  if (topics.length === 0) {
    return (
      <EmptyState
        icon={MapIcon}
        title="No maps found"
        description="There are no map topics yet."
      />
    );
  }

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2", className)}>
      {topics.map((topic) => (
        <MapTopicCard key={topic} topic={topic} onOpen={onOpen} />
      ))}
    </div>
  );
}
