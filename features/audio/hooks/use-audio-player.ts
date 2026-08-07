"use client";

import { useAudioPlayerStore } from "../store";
import { formatRemaining, formatTime, progressFraction } from "../utils";

/**
 * useAudioPlayer — the primary behavior hook of the shared Audio Platform
 * (the web equivalent of Flutter's `AudioController` +
 * `stream_providers.dart` consumption). It projects the reactive store and
 * adds derived display values (progress fraction + formatted time labels).
 *
 * Consumers (Online Songs, Audio Bible, Podcasts) do NOT talk to the engine
 * directly — they call `playQueue([...audioItems])` through this hook / the
 * store, and the Mini/Full players render from it.
 */
export function useAudioPlayer() {
  const store = useAudioPlayerStore();

  return {
    ...store,
    /** 0..1 progress fraction for progress bars / sliders. */
    progress: progressFraction(store.position, store.duration),
    /** Current position as "m:ss" / "h:mm:ss". */
    timeLabel: formatTime(store.position),
    /** Total duration as "m:ss" / "h:mm:ss". */
    durationLabel: formatTime(store.duration),
    /** Remaining time as "-m:ss" (the mini player's counter). */
    remainingLabel: formatRemaining(store.position, store.duration),
  };
}
