"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { SearchX } from "lucide-react";
import type { Song } from "@features/music/types";
import { cn } from "@/utils/cn";
import { SongListItem, type SongListItemProps } from "../song/song-list-item";

export interface SearchResultsProps {
  songs: Song[];
  loading?: boolean;
  error?: Error | string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export type SearchResultsItemProps = Omit<
  SongListItemProps,
  "song" | "className"
>;

export interface SearchResultsWithItemsProps extends SearchResultsProps {
  /** Per-song row props (onOpen, favorite, add-to-playlist, etc.). */
  itemProps?: (song: Song) => SearchResultsItemProps;
}

/**
 * SearchResults — the song search results list. Reuses the shared
 * `LoadingState` / `ErrorState` / `EmptyState` surfaces and the `SongListItem`
 * row — no loading/error/empty or song rendering is duplicated. `itemProps`
 * lets the parent provide per-song interactions (from `useSongSearch` +
 * favorites/navigation hooks).
 */
export function SearchResults({
  songs,
  loading,
  error,
  onRetry,
  itemProps,
  emptyTitle = "No songs found",
  emptyDescription = "Try a different search.",
  className,
}: SearchResultsWithItemsProps) {
  if (loading && songs.length === 0) {
    return <LoadingState label="Searching…" />;
  }
  if (error && songs.length === 0) {
    return (
      <ErrorState
        title="Search failed"
        description={String(error)}
        onRetry={onRetry}
      />
    );
  }
  if (songs.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }
  return (
    <ul className={cn("divide-y divide-border", className)}>
      {songs.map((song) => (
        <li key={song.id}>
          <SongListItem song={song} {...itemProps?.(song)} />
        </li>
      ))}
    </ul>
  );
}
