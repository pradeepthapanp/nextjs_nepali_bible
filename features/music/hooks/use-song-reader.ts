"use client";

import { useCallback } from "react";
import {
  useArtistSongs,
  usePlaylistSongs,
  useSearchSongs,
  useSong,
  useSongs,
} from "../queries";
import { useSongReaderStore } from "../store";
import type { Song, SongReaderSource } from "../types";

/**
 * useSongReader — the reader surface behavior (the web equivalent of
 * `MusicLanded`'s `_currentIndex` logic and page swiper).
 *
 * Composes `SongReaderStore` (source + position — UI state) with React Query
 * (the song list for that source). The list is resolved per source and is
 * NEVER stored, so server data stays in React Query.
 *
 * Responsibilities:
 * - `currentSong` / `songs` (resolved from React Query for the active source);
 * - `next()` / `previous()` — move the swiper position (in-place, no URL);
 * - `openSong(song)` / `openSongById(songId)` — open a single song;
 * - `openSongByPosition(position)` — jump within the current source's list.
 */

/**
 * Resolves the song list for a reader source from React Query. Only the
 * query matching the active source is enabled, so no spurious fetches happen.
 */
function useSourceSongs(source: SongReaderSource | null): Song[] {
  const songSource = source?.type === "song" ? source : null;
  const categorySource = source?.type === "category" ? source : null;
  const searchSource = source?.type === "search" ? source : null;
  const playlistSource = source?.type === "playlist" ? source : null;
  const artistSource = source?.type === "artist" ? source : null;

  const song = useSong(songSource?.songId ?? "", Boolean(songSource));
  const songs = useSongs(categorySource?.category ?? "all", Boolean(categorySource));
  const searchResults = useSearchSongs(searchSource?.query ?? "", "all");
  const playlistSongs = usePlaylistSongs(
    playlistSource?.playlistId ?? "",
    Boolean(playlistSource),
  );
  const artistSongs = useArtistSongs(
    artistSource?.artistId ?? "",
    Boolean(artistSource),
  );

  if (songSource) return song.data ? [song.data] : [];
  if (categorySource) return songs.data ?? [];
  if (searchSource) return searchResults.data ?? [];
  if (playlistSource) return playlistSongs.data ?? [];
  if (artistSource) return artistSongs.data ?? [];
  return [];
}

export function useSongReader() {
  const source = useSongReaderStore((state) => state.source);
  const songPosition = useSongReaderStore((state) => state.songPosition);
  const open = useSongReaderStore((state) => state.open);
  const setSongPosition = useSongReaderStore((state) => state.setSongPosition);
  const clear = useSongReaderStore((state) => state.clear);

  const songs = useSourceSongs(source);

  const currentSong =
    songs.length > 0 ? (songs[songPosition] ?? null) : null;
  const nextSong =
    songPosition < songs.length - 1 ? songs[songPosition + 1] : null;
  const previousSong = songPosition > 0 ? songs[songPosition - 1] : null;

  /** Open a single song (from a Song object). */
  const openSong = useCallback(
    (song: Song) => open({ type: "song", songId: song.id }, 0),
    [open],
  );

  /** Open a single song by id (deep-link resolution). */
  const openSongById = useCallback(
    (songId: string) => open({ type: "song", songId }, 0),
    [open],
  );

  /** Jump to a position within the current source's list. */
  const openSongByPosition = useCallback(
    (position: number) => setSongPosition(position),
    [setSongPosition],
  );

  const next = useCallback(() => {
    if (songPosition < songs.length - 1) setSongPosition(songPosition + 1);
  }, [songPosition, songs.length, setSongPosition]);

  const previous = useCallback(() => {
    if (songPosition > 0) setSongPosition(songPosition - 1);
  }, [songPosition, setSongPosition]);

  return {
    source,
    songPosition,
    songs,
    currentSong,
    nextSong,
    previousSong,
    canGoNext: nextSong !== null,
    canGoPrevious: previousSong !== null,
    open,
    openSong,
    openSongById,
    openSongByPosition,
    next,
    previous,
    clear,
  };
}
