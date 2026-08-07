"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { Song } from "@features/music/types";
import { cn } from "@/utils/cn";
import { FavoriteButton } from "./favorite-button";
import { SongMeta } from "./song-meta";

export interface SongCardProps {
  song: Song;
  onOpen?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  className?: string;
}

/**
 * SongCard — the vertical card surface for a song (grid layouts, favorites,
 * artist detail). Presentational: receives the `Song` + callbacks via props.
 * Reuses `SongMeta` + `FavoriteButton` so no rendering is duplicated.
 */
export function SongCard({
  song,
  onOpen,
  isFavorite,
  onToggleFavorite,
  className,
}: SongCardProps) {
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
      className={cn(
        "h-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        onOpen ? "hover:shadow-md" : "cursor-default",
        className,
      )}
    >
      <CardContent className="flex h-full flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <SongMeta song={song} />
          {onToggleFavorite ? (
            <FavoriteButton
              isFavorite={!!isFavorite}
              onToggle={onToggleFavorite}
              className="-m-1 shrink-0"
            />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
