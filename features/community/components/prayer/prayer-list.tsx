"use client";

import { HeartHandshake } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import type { Prayer } from "../../types";
import { InfiniteScrollSentinel } from "../shared/infinite-scroll-sentinel";
import { PrayerCard } from "./prayer-card";
import { cn } from "@/utils/cn";

export interface PrayerListProps {
  prayers: Prayer[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  onOpen?: (prayer: Prayer) => void;
  /** Per-prayer edit/delete permission (the page wires the pure helper). */
  canManagePrayer?: (prayer: Prayer) => boolean;
  /** Admin/editor publish permission. */
  canModerate?: boolean;
  onPublish?: (id: string) => void;
  onEdit?: (prayer: Prayer) => void;
  onDelete?: (prayer: Prayer) => void;
  className?: string;
}

/**
 * PrayerList — the prayer list surface (the web equivalent of the `PrayersPage`
 * list + its loading/error/empty states + `loadMore`). Presentational: it
 * renders the shared LoadingState/ErrorState/EmptyState + the `PrayerCard`s +
 * the infinite-scroll sentinel. Data + handlers come via props (the page
 * composes `usePrayerLibrary`).
 */
export function PrayerList({
  prayers,
  isLoading,
  isError,
  onRetry,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onOpen,
  canManagePrayer,
  canModerate,
  onPublish,
  onEdit,
  onDelete,
  className,
}: PrayerListProps) {
  if (isLoading) return <LoadingState label="Loading prayers…" />;
  if (isError) {
    return (
      <ErrorState
        title="Error loading prayers"
        description="Something went wrong while loading the prayer requests."
        onRetry={onRetry}
      />
    );
  }
  if (prayers.length === 0) {
    return (
      <EmptyState
        icon={HeartHandshake}
        title="No prayer requests yet"
        description="Be the first to share a prayer request with the community."
      />
    );
  }
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {prayers.map((prayer) => (
        <PrayerCard
          key={prayer.id}
          prayer={prayer}
          canManage={canManagePrayer?.(prayer) ?? false}
          canModerate={canModerate ?? false}
          onOpen={() => onOpen?.(prayer)}
          onPublish={() => onPublish?.(prayer.id)}
          onEdit={() => onEdit?.(prayer)}
          onDelete={() => onDelete?.(prayer)}
        />
      ))}
      <InfiniteScrollSentinel
        hasMore={hasMore ?? false}
        isLoadingMore={isLoadingMore ?? false}
        onLoadMore={() => onLoadMore?.()}
      />
    </div>
  );
}
