"use client";

import { useCallback, useMemo } from "react";
import { useAudioPlayerStore } from "@features/audio";
import { useChapterAudio } from "../queries";
import { useReadingStore } from "../store";
import { toBibleAudioItem } from "../utils";

/**
 * Audio Bible behavior: plays the reader's current chapter through the SHARED
 * Audio Platform — the same engine + MiniAudioPlayer used by `/audio-bible`
 * and Music. `bookNumber`/`chapter` default to the reading store, but callers
 * on `/bible` routes pass the exact position they are displaying (the URL is
 * the source of truth there), so "Play audio" always plays the chapter on
 * screen.
 *
 * NOTE: this replaced the old behavior which only flipped a local `isPlaying`
 * flag on the Bible-local `audio-store` (no `<audio>` element was wired to
 * it). Real playback now goes through `playQueue([toBibleAudioItem(track)])`,
 * and the exposed `isPlaying` reflects whether THIS chapter is the active
 * item in the player.
 */
export function useAudioBible(bookNumber?: number, chapter?: number) {
  const { bookNumber: storeBook, chapter: storeChapter } = useReadingStore();
  const resolvedBook = bookNumber ?? storeBook;
  const resolvedChapter = chapter ?? storeChapter;

  // Shared Audio Platform — targeted subscriptions (no per-tick re-renders)
  // + stable actions.
  const playQueue = useAudioPlayerStore((state) => state.playQueue);
  const togglePlayPause = useAudioPlayerStore(
    (state) => state.togglePlayPause,
  );
  const isPlaying = useAudioPlayerStore((state) => state.isPlaying);
  const currentItem = useAudioPlayerStore((state) => state.currentItem);

  const { data: track } = useChapterAudio(resolvedBook, resolvedChapter);

  /** True when the platform's current item is this exact chapter. */
  const isCurrentChapter = useMemo(
    () =>
      currentItem?.meta?.bookNumber === resolvedBook &&
      currentItem?.meta?.chapter === resolvedChapter,
    [currentItem, resolvedBook, resolvedChapter],
  );

  /** Queue this chapter's track and play (the single queue builder). */
  const playChapter = useCallback(() => {
    if (!track) return;
    playQueue([toBibleAudioItem(track)]);
  }, [track, playQueue]);

  /**
   * Toggle playback for the current chapter: if this chapter is already the
   * loaded item, resume/pause it; otherwise start it (replacing whatever was
   * playing — e.g. a Music track or a different chapter).
   */
  const toggle = useCallback(() => {
    if (isCurrentChapter) togglePlayPause();
    else playChapter();
  }, [isCurrentChapter, togglePlayPause, playChapter]);

  return {
    /** True only while THIS chapter is the one actively playing. */
    isPlaying: isPlaying && isCurrentChapter,
    track,
    playChapter,
    toggle,
    activeChapter: { bookNumber: resolvedBook, chapter: resolvedChapter },
  };
}
