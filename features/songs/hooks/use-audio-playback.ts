"use client";

import { useCallback } from "react";
import { useAudioPlayerStore } from "@features/audio";
import { useIncrementPlayCount } from "../queries";
import type { Audio } from "../types";
import { toAudioItem, toAudioItems } from "../utils";

/**
 * useAudioPlayback — the play behavior for the AudioListPage. It is the ONLY
 * place the feature touches the shared Audio Platform: it maps `Audio`s into
 * `AudioItem`s and hands them to the platform's `playQueue` — it never
 * implements playback/progress/speed/shuffle/repeat itself (all of that lives
 * in `@features/audio`).
 *
 * Mirrors `AudioController.playOrToggleAudioPlaylistFromServer`:
 *   - tapping a DIFFERENT audio → build the queue from the whole list, start at
 *     that index, and bump its play count;
 *   - tapping the CURRENT audio → toggle play/pause (no re-queue, no bump).
 *
 * Reactivity: this hook deliberately does NOT subscribe to the player store
 * (which ticks ~4×/s). It reads the CURRENT state imperatively at action time,
 * so the list page never re-renders on position ticks — the `AudioCard` reads
 * live state via its own targeted platform-store selectors.
 */
export function useAudioPlayback() {
  // Destructure the STABLE `mutate` (the mutation object's identity changes on
  // status updates; the mutate fn itself is stable).
  const { mutate: incrementPlayCount } = useIncrementPlayCount();

  /**
   * Play/toggle an audio within a list. Pass the full visible list so the
   * queue matches the list order (Flutter passes `selectedMusics`).
   */
  const toggleAudio = useCallback(
    (audios: Audio[], index: number) => {
      const audio = audios[index];
      if (!audio) return;
      const player = useAudioPlayerStore.getState();
      if (player.currentItem?.id === audio.id) {
        player.togglePlayPause();
        return;
      }
      player.playQueue(toAudioItems(audios), index);
      incrementPlayCount(audio.id);
    },
    [incrementPlayCount],
  );

  /** The generic AudioItem for one audio (for direct platform use). */
  const toItem = useCallback((audio: Audio) => toAudioItem(audio), []);

  return { toggleAudio, toItem };
}

