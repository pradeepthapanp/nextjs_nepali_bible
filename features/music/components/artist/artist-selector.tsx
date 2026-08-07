"use client";

import { Avatar } from "@/components/ui/avatar";
import type { Artist } from "@features/music/types";
import { cn } from "@/utils/cn";

export interface ArtistSelectorProps {
  artists: Artist[];
  selectedId?: string | null;
  onSelect?: (artistId: string) => void;
  className?: string;
}

/**
 * ArtistSelector — a listbox of selectable artists (used e.g. to assign an
 * artist to an `others` song). Presentational: receives the artists +
 * selected id via props.
 */
export function ArtistSelector({
  artists,
  selectedId,
  onSelect,
  className,
}: ArtistSelectorProps) {
  return (
    <div
      role="listbox"
      aria-label="Select an artist"
      className={cn("max-h-72 overflow-y-auto", className)}
    >
      {artists.map((artist) => {
        const selected = artist.id === selectedId;
        return (
          <button
            key={artist.id}
            type="button"
            role="option"
            aria-selected={selected}
            onClick={() => onSelect?.(artist.id)}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "bg-primary/10 text-primary"
                : "text-foreground hover:bg-accent",
            )}
          >
            <Avatar src={artist.photoUrl} name={artist.name} size="sm" />
            <span className="truncate">{artist.name}</span>
          </button>
        );
      })}
    </div>
  );
}
