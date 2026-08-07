"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Eraser,
  ListMusic,
  Star,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import {
  useFavoriteSongs,
  usePlaylistActions,
  usePlaylistNavigation,
} from "../hooks";
import { usePlaylist, usePlaylistSongs } from "../queries";
import { usePlaylistSelectionStore, useSongReaderStore } from "../store";
import type { Song } from "../types";
import { SongListItem } from "./song/song-list-item";

/**
 * PlaylistDetailPage — the `/playlists/{id}` route (the web equivalent of
 * `playlist_song_page.dart`). Shows the playlist's songs with play / reorder /
 * remove / favorite actions.
 *
 * Compose-only — reuses the existing hooks/components and never duplicates
 * playback or mutation logic:
 *   - `usePlaylist` + `usePlaylistSongs` — the playlist + its ordered songs;
 *   - `usePlaylistActions` (bound to this playlist via
 *     `PlaylistSelectionStore.select`) — remove / reorder / clear;
 *   - `useFavoriteSongs` — per-row favorite hearts;
 *   - `usePlaylistNavigation.openSong` — opens the EXISTING SongReader with
 *     the playlist as its source (so prev/next walk this playlist);
 *   - `SongListItem` — the shared song row.
 *
 * Play "play" here means opening the SongReader (Music songs are lyrics-based
 * — there is no audio/duration column, faithful to the model).
 */
export function PlaylistDetailPage() {
  const params = useParams<{ id?: string }>();
  const playlistId = params?.id ?? "";
  const { openSong, goBack } = usePlaylistNavigation();
  const favorites = useFavoriteSongs();
  const { removeSong, reorder, clear } = usePlaylistActions();

  const playlistQuery = usePlaylist(playlistId);
  const songsQuery = usePlaylistSongs(playlistId, Boolean(playlistId));

  // Bind the shared playlist actions to THIS playlist (removeSong / reorder /
  // clear all target the selected id in `PlaylistSelectionStore`).
  const selectPlaylist = usePlaylistSelectionStore((state) => state.select);
  useEffect(() => {
    if (playlistId) selectPlaylist(playlistId);
    return () => selectPlaylist(null);
  }, [playlistId, selectPlaylist]);

  const [clearOpen, setClearOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const songs = useMemo(() => songsQuery.data ?? [], [songsQuery.data]);
  const playlist = playlistQuery.data;

  const handleOpenSong = useCallback(
    (song: Song, index: number) => {
      // Open the reader with this playlist as its source, then push the
      // song's deep link — the existing reader navigation handles the rest.
      useSongReaderStore
        .getState()
        .open({ type: "playlist", playlistId }, index);
      openSong(song.id);
    },
    [playlistId, openSong],
  );

  const handleMove = useCallback(
    (from: number, to: number) => {
      if (from < 0 || to < 0 || from >= songs.length || to >= songs.length) {
        return;
      }
      void reorder({ from, to });
    },
    [reorder, songs.length],
  );

  const handleRemove = useCallback(
    (songId: string) => void removeSong(songId),
    [removeSong],
  );

  const handleClear = useCallback(async () => {
    setPending(true);
    try {
      await clear(playlistId);
    } finally {
      setPending(false);
      setClearOpen(false);
    }
  }, [clear, playlistId]);

  let body: React.ReactNode;
  if (songsQuery.isLoading || (playlistQuery.isLoading && !playlist)) {
    body = <LoadingState label="Loading playlist…" />;
  } else if (songsQuery.isError || playlistQuery.isError) {
    body = (
      <ErrorState
        title="Playlist could not be loaded"
        description="Please try again in a moment."
        error={(songsQuery.error ?? playlistQuery.error) ?? undefined}
        onRetry={() => {
          void songsQuery.refetch();
          void playlistQuery.refetch();
        }}
      />
    );
  } else if (!playlist) {
    body = (
      <EmptyState
        icon={ListMusic}
        title="Playlist not found"
        description="This playlist may have been deleted."
      />
    );
  } else if (songs.length === 0) {
    body = (
      <EmptyState
        icon={ListMusic}
        title="No songs in this playlist"
        description="Add songs from the Songs page to build this playlist."
      />
    );
  } else {
    body = (
      <ul className="divide-y divide-border">
        {songs.map((song, index) => (
          <li key={song.id} className="flex items-center gap-1 py-1">
            <div className="flex shrink-0 flex-col">
              <button
                type="button"
                aria-label={`Move ${song.name ?? "song"} up`}
                disabled={index === 0}
                onClick={() => handleMove(index, index - 1)}
                className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronUp className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                aria-label={`Move ${song.name ?? "song"} down`}
                disabled={index === songs.length - 1}
                onClick={() => handleMove(index, index + 1)}
                className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronDown className="size-4" aria-hidden />
              </button>
            </div>
            <SongListItem
              song={song}
              index={index}
              onOpen={() => handleOpenSong(song, index)}
              isFavorite={favorites.isFavorite(song.id)}
              onToggleFavorite={() => void favorites.toggleSong(song)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove ${song.name ?? "song"} from playlist`}
              className="shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => handleRemove(song.id)}
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto w-full max-w-6xl space-y-2 px-4 pb-3 pt-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Back to playlists"
                onClick={goBack}
              >
                <ArrowLeft className="size-4" aria-hidden />
              </Button>
              <h1 className="flex min-w-0 items-center gap-2 text-xl font-bold">
                {playlist?.isSystem ? (
                  <Star className="size-5 shrink-0 text-primary" aria-hidden />
                ) : null}
                <span className="truncate">{playlist?.name ?? "Playlist"}</span>
              </h1>
            </div>
            {playlist && !playlist.isSystem && songs.length > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setClearOpen(true)}
              >
                <Eraser className="size-4" aria-hidden />
                Clear
              </Button>
            ) : null}
          </div>
          {playlist ? (
            <p className="text-sm text-muted-foreground">
              {songs.length} {songs.length === 1 ? "song" : "songs"}
            </p>
          ) : null}
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 py-6">{body}</div>

      <ConfirmDialog
        open={clearOpen}
        onOpenChange={setClearOpen}
        title="Clear playlist?"
        description={`Remove all ${songs.length} songs from "${playlist?.name}"?`}
        confirmLabel="Clear"
        variant="destructive"
        loading={pending}
        onConfirm={() => void handleClear()}
      />
    </div>
  );
}
