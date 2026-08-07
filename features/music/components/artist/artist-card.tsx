"use client";

import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { Artist } from "@features/music/types";
import { cn } from "@/utils/cn";

export interface ArtistCardProps {
  artist: Artist;
  songCount?: number;
  onOpen?: () => void;
  className?: string;
}

/**
 * ArtistCard — one artist row/card (the web equivalent of `ArtistListItem`
 * in `artists_page.dart`): photo avatar, name and song count. Presentational:
 * receives the `Artist` + `songCount` via props; the parent resolves the
 * count from `useArtistSongs`.
 */
export function ArtistCard({
  artist,
  songCount,
  onOpen,
  className,
}: ArtistCardProps) {
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
        <Avatar src={artist.photoUrl} name={artist.name} size="md" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-semibold text-foreground">
            {artist.name}
          </span>
          {songCount !== undefined ? (
            <span className="text-xs text-muted-foreground">
              {songCount} {songCount === 1 ? "song" : "songs"}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
