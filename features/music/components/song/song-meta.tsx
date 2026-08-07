"use client";

import type { Song } from "@features/music/types";
import { categoryLabel } from "@features/music/utils";
import { cn } from "@/utils/cn";

export interface SongMetaProps {
  song: Song;
  className?: string;
}

/**
 * SongMeta — the name + category/number subtitle of a song (the web
 * equivalent of the text column in Flutter's song `ListTile` /
 * `music_display.dart`). Presentational: receives the `Song` via props and
 * formats the subtitle with the pure `categoryLabel` helper (no business
 * logic, no fetching).
 */
export function SongMeta({ song, className }: SongMetaProps) {
  const category = song.category ? categoryLabel(song.category) : undefined;
  const subtitle = [category, song.songNumber].filter(Boolean).join(" ");
  return (
    <div className={cn("flex min-w-0 flex-col", className)}>
      <span className="truncate font-medium text-foreground">
        {song.name ?? "Untitled"}
      </span>
      {subtitle ? (
        <span className="truncate text-xs text-muted-foreground">
          {subtitle}
        </span>
      ) : null}
    </div>
  );
}
