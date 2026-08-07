"use client";

import { create } from "zustand";
import { getAudioEngine } from "../services";
import {
  DEFAULT_PLAYBACK_SPEED,
  DEFAULT_REPEAT_MODE,
  REPEAT_CYCLE,
} from "../types";
import type { AudioItem, RepeatMode } from "../types";
import { useAudioSettingsStore } from "./audio-settings-store";

/**
 * Audio player store — the reactive Zustand wrapper around the singleton
 * `AudioEngine` (the web equivalent of Flutter's derived `StreamProvider`s in
 * `lib/providers/audio/stream_providers.dart`). It mirrors engine snapshots
 * into React state and exposes the same action surface as the Flutter
 * `AudioController` (`audio_controller_provider.dart`):
 *
 *   AudioController           →  store action
 *   playOrTogglePlaylist      →  playQueue(items, startIndex)
 *   togglePlayPause           →  togglePlayPause
 *   seek(position)            →  seek(seconds)
 *   next / previous           →  next / previous
 *   playAtIndex               →  playAtIndex
 *   setSpeed                  →  setSpeed
 *   stop                      →  stop
 *   toggleShuffle             →  toggleShuffle
 *   (LoopMode)                →  setRepeatMode / cycleRepeat
 *
 * Components subscribe to specific fields (e.g. the seek bar to `position`,
 * `duration` — updated ~4×/s by `timeupdate`). Server state stays in the
 * engine; this store is the React projection only.
 */

export interface AudioPlayerState {
  queue: AudioItem[];
  currentIndex: number;
  currentItem: AudioItem | null;
  isPlaying: boolean;
  isLoading: boolean;
  position: number;
  duration: number;
  buffered: number;
  speed: number;
  shuffleEnabled: boolean;
  repeatMode: RepeatMode;
  error: string | null;
  hasNext: boolean;
  hasPrevious: boolean;

  playQueue: (items: AudioItem[], startIndex?: number) => void;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  stop: () => void;
  clear: () => void;
  seek: (seconds: number) => void;
  next: () => void;
  previous: () => void;
  playAtIndex: (index: number) => void;
  setSpeed: (speed: number) => void;
  setShuffleEnabled: (enabled: boolean) => void;
  toggleShuffle: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  cycleRepeat: () => void;
}

export const useAudioPlayerStore = create<AudioPlayerState>()((set) => {
  // Client-only: mirror the engine into the store. The engine is DOM-guarded,
  // so this subscription never touches a media element on the server.
  if (typeof window !== "undefined") {
    getAudioEngine().subscribe((snapshot) => {
      set({
        queue: snapshot.queue,
        currentIndex: snapshot.currentIndex,
        currentItem: snapshot.currentItem,
        isPlaying: snapshot.isPlaying,
        isLoading: snapshot.isLoading,
        position: snapshot.position,
        duration: snapshot.duration,
        buffered: snapshot.buffered,
        speed: snapshot.speed,
        shuffleEnabled: snapshot.shuffleEnabled,
        repeatMode: snapshot.repeatMode,
        error: snapshot.error,
        hasNext: snapshot.hasNext,
        hasPrevious: snapshot.hasPrevious,
      });
    });
  }

  return {
    queue: [],
    currentIndex: -1,
    currentItem: null,
    isPlaying: false,
    isLoading: false,
    position: 0,
    duration: 0,
    buffered: 0,
    speed: DEFAULT_PLAYBACK_SPEED,
    shuffleEnabled: false,
    repeatMode: DEFAULT_REPEAT_MODE,
    error: null,
    hasNext: false,
    hasPrevious: false,

    playQueue: (items, startIndex = 0) => {
      // Apply the user's shared audio DEFAULTS (speed / repeat / shuffle)
      // before starting the queue. The engine stays framework-free — the
      // settings store is read at this store boundary only.
      const preferences = useAudioSettingsStore.getState();
      const engine = getAudioEngine();
      engine.setSpeed(preferences.defaultSpeed);
      engine.setRepeatMode(preferences.defaultRepeatMode);
      engine.setShuffleEnabled(preferences.shuffleDefault);
      engine.playQueue(items, startIndex);
    },
    play: () => getAudioEngine().play(),
    pause: () => getAudioEngine().pause(),
    togglePlayPause: () => getAudioEngine().toggle(),
    stop: () => getAudioEngine().stop(),
    clear: () => getAudioEngine().stop(),
    seek: (seconds) => getAudioEngine().seek(seconds),
    next: () => getAudioEngine().next(),
    previous: () => getAudioEngine().previous(),
    playAtIndex: (index) => getAudioEngine().playAtIndex(index),
    setSpeed: (speed) => getAudioEngine().setSpeed(speed),
    setShuffleEnabled: (enabled) =>
      getAudioEngine().setShuffleEnabled(enabled),
    toggleShuffle: () => getAudioEngine().toggleShuffle(),
    setRepeatMode: (mode) => getAudioEngine().setRepeatMode(mode),
    cycleRepeat: () => {
      const current = getAudioEngine().getState().repeatMode;
      const next =
        REPEAT_CYCLE[
          (REPEAT_CYCLE.indexOf(current) + 1) % REPEAT_CYCLE.length
        ];
      getAudioEngine().setRepeatMode(next);
    },
  };
});
