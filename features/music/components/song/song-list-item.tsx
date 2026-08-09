"use client";

import { ChevronRight, Plus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import type { Song } from "@features/music/types";
import { isOthersCategory } from "@features/music/utils";
import { cn } from "@/utils/cn";
import { FavoriteButton } from "./favorite-button";
import { SongMeta } from "./song-meta";

export interface SongListItemProps {
  song: Song;
  /** Display index (fallback number badge when `song.songNumber` is absent). */
  index?: number;
  /** Artist photo for `others` (artist-linked) songs — provided by the parent
   * (it resolves `useArtist`), so the component never fetches. */
  artistPhotoUrl?: string;
  onOpen?: () => void;
  onAddToPlaylist?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  /** Disables the favorite + add-to-playlist actions (e.g. signed-out users). */
  disabled?: boolean;
  className?: string;
}

/**
 * SongListItem — the horizontal song row (the web equivalent of the song
 * `ListTile` in `music_display.dart` / `playlist_song_page.dart`): a leading
 * number badge (or the artist photo for `others` songs, like
 * `song_leading_widget.dart`), the `SongMeta`, and action affordances.
 * Presentational: receives the `Song` + callbacks via props.
 */
export function SongListItem({
  song,
  index,
  artistPhotoUrl,
  onOpen,
  onAddToPlaylist,
  isFavorite,
  onToggleFavorite,
  disabled,
  className,
}: SongListItemProps) {
  const leading = isOthersCategory(song.category) ? (
    <Avatar
      src={artistPhotoUrl}
      name={song.artist ?? song.name}
      size="md"
      className="rounded-lg"
    />
  ) : (
    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
      {song.songNumber ?? (index !== undefined ? String(index + 1) : "")}
    </span>
  );

  return (
    <div
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
        "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left",
        onOpen && "cursor-pointer hover:bg-accent/60",
        className,
      )}
    >
      {leading}
      <SongMeta song={song} className="flex-1" />
      {onAddToPlaylist ? (
        <button
          type="button"
          aria-label={`Add ${song.name ?? "song"} to playlist`}
          onClick={(event) => {
            event.stopPropagation();
            onAddToPlaylist();
          }}
          disabled={disabled}
          className={cn(
            "rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground",
            disabled &&
              "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-muted-foreground",
          )}
        >
          <Plus className="size-4" aria-hidden />
        </button>
      ) : null}
      {onToggleFavorite ? (
        <FavoriteButton
          isFavorite={!!isFavorite}
          onToggle={(event) => {
            event.stopPropagation();
            onToggleFavorite();
          }}
          disabled={disabled}
          className="shrink-0"
        />
      ) : null}
      {onOpen ? (
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      ) : null}
    </div>
  );
}
