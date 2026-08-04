"use client";

import { useCallback } from "react";
import { useChapterAudio } from "../queries";
import { useAudioStore, useReadingStore } from "../store";

/**
 * Audio Bible behavior: ties the reader's current chapter to the audio store
 * and loads the matching track. The future AudioPlayerBar renders from this —
 * play/pause/rate live in `audio-store`; the track data comes from
 * `useChapterAudio`. Auto-advance to the next chapter is added during the
 * audio feature build.
 */
export function useAudioBible() {
  const { isPlaying, chapter, playbackRate, toggle, play, pause, setChapter, setPlaybackRate } =
    useAudioStore();
  const { bookNumber, chapter: readerChapter } = useReadingStore();

  const { data: track } = useChapterAudio(bookNumber, readerChapter);

  const playChapter = useCallback(() => {
    setChapter(bookNumber, readerChapter);
    play();
  }, [bookNumber, readerChapter, setChapter, play]);

  return {
    isPlaying,
    playbackRate,
    track,
    playChapter,
    toggle,
    play,
    pause,
    setPlaybackRate,
    activeChapter: chapter,
  };
}
