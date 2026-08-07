"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { ListMusic } from "lucide-react";
import type { Playlist } from "@features/music/types";
import { cn } from "@/utils/cn";
import { PlaylistCard } from "./playlist-card";

export interface PlaylistListProps {
  playlists: Playlist[];
  /** Optional per-playlist song counts keyed by playlist id. */
  songCounts?: Record<string, number>;
  onOpen?: (playlist: Playlist) => void;
  onEdit?: (playlist: Playlist) => void;
  onDelete?: (playlist: Playlist) => void;
  /** Empty the playlist's songs (non-system playlists only). */
  onClear?: (playlist: Playlist) => void;
  /** Optional action rendered inside the empty state (e.g. Create playlist). */
  emptyAction?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

/**
 * PlaylistList — the playlist list (the web equivalent of the
 * `ListView.builder` in `playlist_view.dart`). Composes `PlaylistCard` and
 * reuses the shared `EmptyState` when there are no playlists (optionally with
 * a caller-supplied `emptyAction`, e.g. the Create-playlist button).
 */
export function PlaylistList({
  playlists,
  songCounts,
  onOpen,
  onEdit,
  onDelete,
  onClear,
  emptyAction,
  emptyTitle = "No playlists yet",
  emptyDescription = "Create your first playlist to get started.",
  className,
}: PlaylistListProps) {
  if (playlists.length === 0) {
    return (
      <EmptyState
        icon={ListMusic}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }
  return (
    <ul className={cn("space-y-2", className)}>
      {playlists.map((playlist) => (
        <li key={playlist.id}>
          <PlaylistCard
            playlist={playlist}
            songCount={songCounts?.[playlist.id]}
            onOpen={onOpen ? () => onOpen(playlist) : undefined}
            onEdit={onEdit ? () => onEdit(playlist) : undefined}
            onDelete={onDelete ? () => onDelete(playlist) : undefined}
            onClear={onClear ? () => onClear(playlist) : undefined}
          />
        </li>
      ))}
    </ul>
  );
}
