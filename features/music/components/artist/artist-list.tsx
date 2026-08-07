"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { UserRound } from "lucide-react";
import type { Artist } from "@features/music/types";
import { cn } from "@/utils/cn";
import { ArtistCard } from "./artist-card";

export interface ArtistListProps {
  artists: Artist[];
  /** Optional per-artist song counts keyed by artist id. */
  songCounts?: Record<string, number>;
  onOpen?: (artist: Artist) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

/**
 * ArtistList — the artist list (the web equivalent of the `ListView.builder`
 * in `artists_page.dart`). Presentational: receives the already-sorted /
 * filtered `artists` via props, composes `ArtistCard`, and reuses the shared
 * `EmptyState` when there are no artists.
 */
export function ArtistList({
  artists,
  songCounts,
  onOpen,
  emptyTitle = "No artists",
  emptyDescription = "There are no artists to show yet.",
  className,
}: ArtistListProps) {
  if (artists.length === 0) {
    return (
      <EmptyState
        icon={UserRound}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }
  return (
    <ul className={cn("space-y-2", className)}>
      {artists.map((artist) => (
        <li key={artist.id}>
          <ArtistCard
            artist={artist}
            songCount={songCounts?.[artist.id]}
            onOpen={onOpen ? () => onOpen(artist) : undefined}
          />
        </li>
      ))}
    </ul>
  );
}
