"use client";

import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Playlist, Song } from "@features/music/types";
import { cn } from "@/utils/cn";
import { DialogPanel } from "../dialogs/dialog-panel";

export interface AddToPlaylistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The song being added to a playlist. */
  song: Song;
  playlists: Playlist[];
  /** Whether the song is already in a given playlist (resolved by the parent
   * via `usePlaylistSongs` — the dialog never fetches). */
  isInPlaylist?: (playlistId: string) => boolean;
  /** Toggle the song in/out of a playlist (the parent composes
   * `usePlaylistSongMutations`/`usePlaylistActions`). */
  onToggleSong?: (playlistId: string, added: boolean) => void;
  /** Open the create-playlist dialog. */
  onCreate?: () => void;
  className?: string;
}

/**
 * AddToPlaylistDialog — the "Add to Playlist" sheet/dialog (the web
 * equivalent of `playlist_sheet.dart`): lists the user's playlists and toggles
 * the song's membership in each. Presentational: membership state and the
 * toggle action are passed in via props (the parent composes the playlist
 * queries + mutations), so the dialog never queries or mutates.
 */
export function AddToPlaylistDialog({
  open,
  onOpenChange,
  song,
  playlists,
  isInPlaylist,
  onToggleSong,
  onCreate,
  className,
}: AddToPlaylistDialogProps) {
  return (
    <DialogPanel
      open={open}
      onOpenChange={onOpenChange}
      title={`Add to playlist`}
      description={song.name ?? undefined}
      className={cn("max-h-[80vh] overflow-y-auto", className)}
    >
      <ul role="list" className="space-y-1">
        {playlists.map((playlist) => {
          const inPlaylist = isInPlaylist?.(playlist.id) ?? false;
          return (
            <li key={playlist.id}>
              <button
                type="button"
                aria-pressed={inPlaylist}
                onClick={() => onToggleSong?.(playlist.id, !inPlaylist)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  inPlaylist
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-accent",
                )}
              >
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded border",
                    inPlaylist
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input",
                  )}
                >
                  {inPlaylist ? <Check className="size-3" aria-hidden /> : null}
                </span>
                <span className="truncate">{playlist.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {onCreate ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2 w-full"
          onClick={onCreate}
        >
          <Plus className="size-4" aria-hidden />
          Create playlist
        </Button>
      ) : null}
    </DialogPanel>
  );
}
