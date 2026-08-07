"use client";

import { Eraser, Heart, ListMusic, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Playlist } from "@features/music/types";
import { timeAgo } from "@/utils/time-ago";
import { cn } from "@/utils/cn";

export interface PlaylistCardProps {
  playlist: Playlist;
  songCount?: number;
  onOpen?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  /** Empty the playlist's songs (non-system playlists only). */
  onClear?: () => void;
  className?: string;
}

/**
 * PlaylistCard — one playlist row/card (the web equivalent of `_PlaylistTile`
 * in `playlist_view.dart`): icon, name (with a "System" badge for `isSystem`
 * playlists, e.g. Favorites), description, song count and last-updated time,
 * plus edit/clear/delete actions for non-system playlists. Presentational:
 * receives the `Playlist` + callbacks via props.
 */
export function PlaylistCard({
  playlist,
  songCount,
  onOpen,
  onEdit,
  onDelete,
  onClear,
  className,
}: PlaylistCardProps) {
  const Icon = playlist.isSystem ? Heart : ListMusic;
  return (
    <Card
      interactive={Boolean(onOpen)}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={
        onOpen
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onOpen();
              }
            }
          : undefined
      }
      className={cn("w-full", onOpen && "cursor-pointer", className)}
    >
      <CardContent className="flex items-center gap-3 p-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-semibold text-foreground">
              {playlist.name}
            </span>
            {playlist.isSystem ? (
              <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                System
              </span>
            ) : null}
          </div>
          {playlist.description ? (
            <p className="truncate text-xs text-muted-foreground">
              {playlist.description}
            </p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            {songCount !== undefined
              ? `${songCount} ${songCount === 1 ? "song" : "songs"}`
              : ""}
            {playlist.updatedAt ? (
              <>
                {songCount !== undefined ? " · " : ""}
                Updated {timeAgo(playlist.updatedAt)}
              </>
            ) : null}
          </p>
        </div>
        {!playlist.isSystem && (onEdit || onDelete || onClear) ? (
          <div className="flex shrink-0 gap-1">
            {onEdit ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Edit playlist ${playlist.name}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit();
                }}
              >
                <Pencil className="size-4" aria-hidden />
              </Button>
            ) : null}
            {onClear ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Clear playlist ${playlist.name}`}
                className="text-muted-foreground hover:text-foreground"
                onClick={(event) => {
                  event.stopPropagation();
                  onClear();
                }}
              >
                <Eraser className="size-4" aria-hidden />
              </Button>
            ) : null}
            {onDelete ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Delete playlist ${playlist.name}`}
                className="text-muted-foreground hover:text-destructive"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
