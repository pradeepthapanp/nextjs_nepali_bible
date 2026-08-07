"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  DEFAULT_PLAYBACK_SPEED,
  DEFAULT_REPEAT_MODE,
  type RepeatMode,
} from "../types";

/**
 * AudioSettings — the ONE shared audio playback PREFERENCES store (defaults,
 * not playback state).
 *
 * The live playback state (current speed / repeat / shuffle / queue) stays in
 * the `AudioEngine` + `useAudioPlayerStore` — this store only holds the
 * DEFAULTS the user prefers, so new queues start with them. It is consumed by:
 *   - the Settings → Audio section (edit these preferences), and
 *   - `useAudioPlayerStore.playQueue`, which applies them to the engine before
 *     starting a queue (so the defaults actually take effect without the
 *     engine knowing about React/Zustand).
 *
 * PERSISTED to localStorage (`audio.settings`), mirroring Flutter's
 * `SharedPreferences` for playback speed. It is deliberately tiny (3 fields)
 * and feature-agnostic — part of the shared Audio Platform.
 */

export interface AudioSettings {
  /** Speed applied to every newly queued item. */
  defaultSpeed: number;
  /** Repeat mode applied to every new queue. */
  defaultRepeatMode: RepeatMode;
  /** Whether a new queue starts shuffled. */
  shuffleDefault: boolean;
}

interface AudioSettingsState extends AudioSettings {
  setDefaultSpeed: (value: number) => void;
  setDefaultRepeatMode: (mode: RepeatMode) => void;
  setShuffleDefault: (value: boolean) => void;
  reset: () => void;
}

export const useAudioSettingsStore = create<AudioSettingsState>()(
  persist(
    (set) => ({
      defaultSpeed: DEFAULT_PLAYBACK_SPEED,
      defaultRepeatMode: DEFAULT_REPEAT_MODE,
      shuffleDefault: false,
      setDefaultSpeed: (defaultSpeed) => set({ defaultSpeed }),
      setDefaultRepeatMode: (defaultRepeatMode) =>
        set({ defaultRepeatMode }),
      setShuffleDefault: (shuffleDefault) => set({ shuffleDefault }),
      reset: () =>
        set({
          defaultSpeed: DEFAULT_PLAYBACK_SPEED,
          defaultRepeatMode: DEFAULT_REPEAT_MODE,
          shuffleDefault: false,
        }),
    }),
    {
      name: "audio.settings",
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<AudioSettingsState>),
      }),
      version: 1,
    },
  ),
);
