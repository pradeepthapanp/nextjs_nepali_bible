"use client";

import { create } from "zustand";

/**
 * Audio Bible playback UI state. The actual <audio> element is owned by the
 * future AudioPlayerBar; this store tracks playback intent (playing, current
 * chapter, rate) so the player can auto-advance chapters and stay in sync with
 * the reader. Mirrors the Flutter `bible_audio` play/pause state.
 */
interface AudioState {
  isPlaying: boolean;
  /** The chapter currently loaded in the player. */
  chapter?: { bookNumber: number; chapter: number };
  playbackRate: number;
  toggle: () => void;
  play: () => void;
  pause: () => void;
  setChapter: (bookNumber: number, chapter: number) => void;
  setPlaybackRate: (rate: number) => void;
}

export const useAudioStore = create<AudioState>()((set) => ({
  isPlaying: false,
  chapter: undefined,
  playbackRate: 1,
  toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  setChapter: (bookNumber, chapter) => set({ chapter: { bookNumber, chapter } }),
  setPlaybackRate: (playbackRate) => set({ playbackRate }),
}));
