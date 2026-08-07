import type { AudioItem } from "./audio-item";

/**
 * Repeat modes — the web replacement for `just_audio`'s `LoopMode`
 * (off / all / one), which Flutter drives through `AudioPlayer` but only
 * configures programmatically (the sheets expose shuffle + speed, not repeat).
 * The platform exposes all three so repeat is fully supported.
 */
export type RepeatMode = "off" | "all" | "one";

/**
 * A point-in-time snapshot of the playback engine — the web replacement for
 * the derived `just_audio` streams Flutter watches in
 * `lib/providers/audio/stream_providers.dart`
 * (playingStream, positionStream, durationStream, speedStream,
 * shuffleModeEnabledStream, sequenceStateStream, processingStateStream, …).
 * Times are in SECONDS (Flutter used `Duration`s).
 */
export interface AudioPlayerSnapshot {
  /** The full queue (the equivalent of `SequenceState.sequence`). */
  queue: AudioItem[];
  /** Index of the current item in `queue`, or -1 when empty. */
  currentIndex: number;
  currentItem: AudioItem | null;
  isPlaying: boolean;
  /** true while loading/buffering a source (Flutter `ProcessingState.loading/buffering`). */
  isLoading: boolean;
  position: number;
  duration: number;
  /** Buffered seconds (for the seek-bar buffered indicator). */
  buffered: number;
  speed: number;
  shuffleEnabled: boolean;
  repeatMode: RepeatMode;
  /** Last playback error message, or null. */
  error: string | null;
  /** Whether `next()` can advance (mirrors `AudioPlayer.hasNext` + repeat-all wrap). */
  hasNext: boolean;
  /** Whether `previous()` can go back or restart (mirrors `AudioPlayer.hasPrevious`). */
  hasPrevious: boolean;
}
