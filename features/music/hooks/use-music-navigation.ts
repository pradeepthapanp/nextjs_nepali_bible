"use client";

import { useCallback, useEffect } from "react";
import { useSongReaderStore } from "../store";
import { useMusicDeepLink } from "./use-music-deep-link";
import { useSongReader } from "./use-song-reader";

/**
 * useSongNavigation — the single navigation entry point for the Song Reader
 * (the counterpart to the Bible module's `useBibleNavigation`).
 *
 * Reuses `useSongReader` (source + position, next/previous) and
 * `useMusicDeepLink` (deep-link parse/build + router), so no navigation logic
 * is duplicated:
 * - `openSongById` / `openSongByPosition` — open in the reader AND push the
 *   deep-link URL (browser history + refresh-safe location);
 * - `next` / `previous` — move the reader position AND push the new song's URL;
 * - URL → reader sync: land on a deep-linked `/music/song/{id}` when the
 *   reader isn't already open (in-app next/prev keeps the list source), and
 *   clear the reader on `/music`.
 */
export function useSongNavigation() {
  const {
    songs,
    canGoNext,
    nextSong,
    next: readerNext,
    canGoPrevious,
    previousSong,
    previous: readerPrevious,
    openSongById: readerOpenSongById,
    openSongByPosition: readerOpenSongByPosition,
  } = useSongReader();
  const { navigate, currentLink } = useMusicDeepLink();

  /** Open a song by id and push its deep link. */
  const openSongById = useCallback(
    (songId: string) => {
      readerOpenSongById(songId);
      navigate({ kind: "song", songId });
    },
    [readerOpenSongById, navigate],
  );

  /** Jump to a position in the current list and push that song's deep link. */
  const openSongByPosition = useCallback(
    (position: number) => {
      const target = songs?.[position];
      readerOpenSongByPosition(position);
      if (target) navigate({ kind: "song", songId: target.id });
    },
    [songs, readerOpenSongByPosition, navigate],
  );

  /** Next song: move the reader and push its deep link. */
  const next = useCallback(() => {
    if (!canGoNext || !nextSong) return;
    readerNext();
    navigate({ kind: "song", songId: nextSong.id });
  }, [canGoNext, nextSong, readerNext, navigate]);

  /** Previous song: move the reader and push its deep link. */
  const previous = useCallback(() => {
    if (!canGoPrevious || !previousSong) return;
    readerPrevious();
    navigate({ kind: "song", songId: previousSong.id });
  }, [canGoPrevious, previousSong, readerPrevious, navigate]);

  // URL → reader sync (deep-link landing / back-forward / section exit).
  //
  // The reader owns the `song` kind; every other kind is a LIST surface
  // (`songs` / `category` / `search` / `artist` / playlist / artists / chords)
  // that must reset the reader context.
  useEffect(() => {
    if (!currentLink) return;
    if (currentLink.kind !== "song") {
      useSongReaderStore.getState().clear();
      return;
    }
    const store = useSongReaderStore.getState();
    if (!store.source) {
      // Fresh deep-link landing: open as a single-song reader.
      store.open({ type: "song", songId: currentLink.songId }, 0);
      return;
    }
    // In-app next/prev already moved the position AND pushed the URL, so the
    // displayed song matches the URL — nothing to do. An EXTERNAL URL change
    // (browser Back/Forward, a pasted link) to a song inside the current
    // list syncs the position to it; a song outside the list re-opens as a
    // single-song reader.
    const currentSong = songs[store.songPosition];
    if (songs.length > 0 && currentSong?.id !== currentLink.songId) {
      const index = songs.findIndex((song) => song.id === currentLink.songId);
      if (index >= 0) store.setSongPosition(index);
      else store.open({ type: "song", songId: currentLink.songId }, 0);
    }
  }, [currentLink, songs]);

  return { openSongById, openSongByPosition, next, previous, currentLink };
}
