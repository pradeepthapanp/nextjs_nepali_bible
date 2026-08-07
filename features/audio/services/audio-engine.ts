import {
  PREVIOUS_RESTART_THRESHOLD,
} from "../types";
import type {
  AudioItem,
  AudioPlayerSnapshot,
  RepeatMode,
} from "../types";

/**
 * AudioEngine — the playback core of the shared Audio Platform. It is the web
 * replacement for `just_audio`'s `AudioPlayer` (plus the `AudioController`
 * orchestration in `lib/providers/audio/audio_controller_provider.dart`):
 *
 *   Flutter just_audio            →  AudioEngine
 *   AudioPlayer() + AudioSession  →  a singleton HTML5 <audio> element
 *   setAudioSource(ConcatenatingAudioSource, initialIndex)  →  playQueue()
 *   playing / pause / stop        →  play() / pause() / stop()
 *   seekToNext / seekToPrevious   →  next() / previous()
 *   setSpeed / shuffle / LoopMode →  setSpeed / setShuffleEnabled / setRepeatMode
 *   position/duration/speed/sequence streams  →  subscribe() → snapshot
 *
 * The engine is framework-free and DOM-guarded (no `<audio>` is created on the
 * server), so it is safe to import anywhere. It is feature-agnostic — it only
 * knows `AudioItem`s. The reactive store (`store/audio-player-store.ts`)
 * mirrors `subscribe()` snapshots into Zustand for React consumption, and the
 * Media Session bridge (`media-session.ts`) is bound by the player host.
 */

type EngineListener = (snapshot: AudioPlayerSnapshot) => void;

export class AudioEngine {
  private audio: HTMLAudioElement | null = null;
  private queue: AudioItem[] = [];
  private currentIndex = -1;
  private shuffleEnabled = false;
  /** Play order when shuffling — a permutation of queue indices. */
  private shuffleOrder: number[] = [];
  private repeatMode: RepeatMode = "off";
  private speed = 1;
  private isLoading = false;
  private errorMessage: string | null = null;
  private listeners = new Set<EngineListener>();

  constructor() {
    // Client-only: the server never constructs a media element.
    if (typeof document === "undefined") return;
    const audio = new Audio();
    audio.preload = "metadata";
    this.audio = audio;
    this.bindAudioEvents(audio);
  }

  // ---------------------------------------------------------------------------
  // Queue management
  // ---------------------------------------------------------------------------

  /** Load a queue and start playing the item at `startIndex` (default 0). */
  playQueue(items: AudioItem[], startIndex = 0): void {
    this.stopInternal();
    this.queue = [...items];
    if (this.queue.length === 0) {
      this.currentIndex = -1;
      this.emit();
      return;
    }
    const index =
      startIndex >= 0 && startIndex < this.queue.length ? startIndex : 0;
    this.currentIndex = index;
    if (this.shuffleEnabled) this.buildShuffleOrder(index);
    this.playAtIndex(index);
  }

  /** Play a specific queue index (the full player's queue list). */
  playAtIndex(index: number): void {
    if (index < 0 || index >= this.queue.length) return;
    this.currentIndex = index;
    const item = this.queue[index];
    const audio = this.audio;
    if (!audio) return;
    this.isLoading = true;
    this.errorMessage = null;
    audio.src = item.audioUrl;
    audio.playbackRate = this.speed;
    audio
      .play()
      .catch(() => {
        this.isLoading = false;
        this.errorMessage = "Audio playback failed";
        this.emit();
      });
    this.emit();
  }

  /** Advance to the next item (respecting the shuffle order + repeat mode). */
  next(): void {
    const next = this.nextIndex();
    if (next !== -1) {
      this.playAtIndex(next);
    } else if (this.repeatMode === "all") {
      this.playAtIndex(0);
    }
    // Repeat off at the end: stay put (no-op), like just_audio.seekToNext.
  }

  /**
   * Go to the previous item. Restarts the current item when more than
   * `PREVIOUS_RESTART_THRESHOLD` seconds in (just_audio `seekToPrevious`).
   */
  previous(): void {
    const audio = this.audio;
    if (audio && audio.currentTime > PREVIOUS_RESTART_THRESHOLD) {
      this.seek(0);
      return;
    }
    const previous = this.previousIndex();
    if (previous !== -1) {
      this.playAtIndex(previous);
    } else {
      this.seek(0);
    }
  }

  // ---------------------------------------------------------------------------
  // Transport
  // ---------------------------------------------------------------------------

  play(): void {
    void this.audio?.play().catch(() => undefined);
    this.emit();
  }

  pause(): void {
    this.audio?.pause();
    this.emit();
  }

  toggle(): void {
    if (this.audio?.paused) this.play();
    else this.pause();
  }

  /**
   * Stop playback and clear the queue + current item — the web equivalent of
   * the Flutter `AudioController.stop()` which calls `_player.stop()` then
   * `setAudioSource(ConcatenatingAudioSource(children: []))`.
   */
  stop(): void {
    this.stopInternal();
    this.emit();
  }

  seek(seconds: number): void {
    const audio = this.audio;
    if (audio && Number.isFinite(seconds)) {
      audio.currentTime = Math.max(0, seconds);
    }
    this.emit();
  }

  setSpeed(speed: number): void {
    this.speed = speed;
    if (this.audio) this.audio.playbackRate = speed;
    this.emit();
  }

  setShuffleEnabled(enabled: boolean): void {
    if (enabled === this.shuffleEnabled) return;
    this.shuffleEnabled = enabled;
    if (enabled) {
      this.buildShuffleOrder(this.currentIndex >= 0 ? this.currentIndex : 0);
    } else {
      this.shuffleOrder = [];
    }
    this.emit();
  }

  toggleShuffle(): void {
    this.setShuffleEnabled(!this.shuffleEnabled);
  }

  setRepeatMode(mode: RepeatMode): void {
    if (mode === this.repeatMode) return;
    this.repeatMode = mode;
    this.emit();
  }

  // ---------------------------------------------------------------------------
  // State + subscription
  // ---------------------------------------------------------------------------

  getState(): AudioPlayerSnapshot {
    return this.snapshot();
  }

  /** Subscribe to engine state. Calls `listener` immediately with the current
   * snapshot, then on every change. Returns an unsubscribe function. */
  subscribe(listener: EngineListener): () => void {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  dispose(): void {
    this.listeners.clear();
    const audio = this.audio;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    this.audio = null;
  }

  // ---------------------------------------------------------------------------
  // Internals
  // ---------------------------------------------------------------------------

  private stopInternal(): void {
    const audio = this.audio;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    this.currentIndex = -1;
    this.queue = [];
    this.shuffleOrder = [];
    this.isLoading = false;
    this.errorMessage = null;
  }

  private bindAudioEvents(audio: HTMLAudioElement): void {
    audio.addEventListener("play", () => this.emit());
    audio.addEventListener("pause", () => this.emit());
    audio.addEventListener("timeupdate", () => this.emit());
    audio.addEventListener("durationchange", () => this.emit());
    audio.addEventListener("progress", () => this.emit());
    audio.addEventListener("loadedmetadata", () => {
      this.isLoading = false;
      this.emit();
    });
    audio.addEventListener("canplay", () => {
      this.isLoading = false;
      this.emit();
    });
    audio.addEventListener("playing", () => {
      this.isLoading = false;
      this.emit();
    });
    audio.addEventListener("waiting", () => {
      this.isLoading = true;
      this.emit();
    });
    audio.addEventListener("error", () => {
      this.isLoading = false;
      this.errorMessage = "Audio playback failed";
      this.emit();
    });
    audio.addEventListener("ended", () => this.handleEnded());
  }

  private handleEnded(): void {
    if (this.repeatMode === "one") {
      this.seek(0);
      this.play();
      return;
    }
    const next = this.nextIndex();
    if (next !== -1) {
      this.playAtIndex(next);
    } else if (this.repeatMode === "all") {
      this.playAtIndex(0);
    } else {
      // Repeat off at the end of the queue: stop but keep the last item.
      this.audio?.pause();
      this.seek(0);
    }
  }

  private buildShuffleOrder(startIndex: number): void {
    const indices = this.queue.map((_, index) => index);
    const start = indices.indexOf(startIndex);
    if (start !== -1) indices.splice(start, 1);
    // Fisher–Yates shuffle of the remaining indices.
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    // Current item first, then the shuffled rest.
    this.shuffleOrder = [startIndex, ...indices];
  }

  private nextIndex(): number {
    if (this.queue.length === 0 || this.currentIndex < 0) return -1;
    if (this.shuffleOrder.length > 0) {
      const pos = this.shuffleOrder.indexOf(this.currentIndex);
      const next = this.shuffleOrder[pos + 1];
      return next === undefined ? -1 : next;
    }
    return this.currentIndex + 1 < this.queue.length
      ? this.currentIndex + 1
      : -1;
  }

  private previousIndex(): number {
    if (this.queue.length === 0 || this.currentIndex < 0) return -1;
    if (this.shuffleOrder.length > 0) {
      const pos = this.shuffleOrder.indexOf(this.currentIndex);
      const prev = this.shuffleOrder[pos - 1];
      return prev === undefined ? -1 : prev;
    }
    return this.currentIndex - 1 >= 0 ? this.currentIndex - 1 : -1;
  }

  private bufferedSeconds(): number {
    const audio = this.audio;
    if (!audio) return 0;
    try {
      const ranges = audio.buffered;
      if (ranges.length === 0) return 0;
      return ranges.end(ranges.length - 1);
    } catch {
      return 0;
    }
  }

  private snapshot(): AudioPlayerSnapshot {
    const currentIndex = this.currentIndex;
    const currentItem =
      currentIndex >= 0 && currentIndex < this.queue.length
        ? this.queue[currentIndex]
        : null;
    const audio = this.audio;
    const position = audio && Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    const duration = audio && Number.isFinite(audio.duration) ? audio.duration : 0;
    return {
      queue: this.queue,
      currentIndex,
      currentItem,
      isPlaying: audio ? !audio.paused && !audio.ended : false,
      isLoading: this.isLoading,
      position,
      duration,
      buffered: this.bufferedSeconds(),
      speed: this.speed,
      shuffleEnabled: this.shuffleEnabled,
      repeatMode: this.repeatMode,
      error: this.errorMessage,
      hasNext: this.nextIndex() !== -1 || this.repeatMode === "all",
      hasPrevious:
        this.previousIndex() !== -1 ||
        (audio ? audio.currentTime > PREVIOUS_RESTART_THRESHOLD : false),
    };
  }

  private emit(): void {
    const snapshot = this.snapshot();
    this.listeners.forEach((listener) => listener(snapshot));
  }
}
