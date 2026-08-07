"use client";

import { Heart, ListMusic } from "lucide-react";
import type { Playlist } from "@features/music/types";
import { cn } from "@/utils/cn";

export interface PlaylistSelectorProps {
  playlists: Playlist[];
  selectedId?: string | null;
  onSelect?: (playlistId: string) => void;
  className?: string;
}

/**
 * PlaylistSelector — a listbox of selectable playlists (used by the "Add to
 * Playlist" flow). Presentational: receives the playlists + selected id via
 * props; membership toggling is delegated to the parent.
 */
export function PlaylistSelector({
  playlists,
  selectedId,
  onSelect,
  className,
}: PlaylistSelectorProps) {
  return (
    <div
      role="listbox"
      aria-label="Select a playlist"
      className={cn("max-h-72 overflow-y-auto", className)}
    >
      {playlists.map((playlist) => {
        const selected = playlist.id === selectedId;
        const Icon = playlist.isSystem ? Heart : ListMusic;
        return (
          <button
            key={playlist.id}
            type="button"
            role="option"
            aria-selected={selected}
            onClick={() => onSelect?.(playlist.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "bg-primary/10 text-primary"
                : "text-foreground hover:bg-accent",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{playlist.name}</span>
          </button>
        );
      })}
    </div>
  );
}
