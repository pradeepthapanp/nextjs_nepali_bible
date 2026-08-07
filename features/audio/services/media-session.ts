import { SEEK_STEP_SECONDS } from "../types";
import type { AudioEngine } from "./audio-engine";

/**
 * Media Session API bridge — the web replacement for Flutter's
 * `just_audio_background` (`MediaItem` metadata + lock-screen/notification
 * playback controls). The player host binds this once to the engine; it keeps
 * `navigator.mediaSession` in sync with the current item and wires the system
 * action handlers (play / pause / next / previous / seek / stop) back to the
 * engine, so playback is controllable from the OS media UI and hardware keys.
 *
 * SSR-safe: returns a no-op unsubscribe when `navigator.mediaSession` is
 * unavailable.
 */
export function bindMediaSession(engine: AudioEngine): () => void {
  if (
    typeof navigator === "undefined" ||
    !("mediaSession" in navigator) ||
    !navigator.mediaSession
  ) {
    return () => undefined;
  }

  const session = navigator.mediaSession;

  session.setActionHandler("play", () => engine.play());
  session.setActionHandler("pause", () => engine.pause());
  session.setActionHandler("previoustrack", () => engine.previous());
  session.setActionHandler("nexttrack", () => engine.next());
  session.setActionHandler("seekbackward", (details) => {
    engine.seek(
      Math.max(
        0,
        engine.getState().position - (details.seekOffset ?? SEEK_STEP_SECONDS),
      ),
    );
  });
  session.setActionHandler("seekforward", (details) => {
    engine.seek(engine.getState().position + (details.seekOffset ?? SEEK_STEP_SECONDS));
  });
  session.setActionHandler("seekto", (details) => {
    if (details.seekTime != null) engine.seek(details.seekTime);
  });
  session.setActionHandler("stop", () => engine.stop());

  let lastItemId: string | null = null;
  let lastPosition = -1;

  // Keep metadata + playback/position state in sync with the engine. Metadata
  // is only rewritten when the item changes; position state is throttled so we
  // don't spam the browser at ~4Hz.
  const unsubscribe = engine.subscribe((state) => {
    const item = state.currentItem;

    if (item?.id !== lastItemId) {
      lastItemId = item?.id ?? null;
      lastPosition = -1;
      if (item) {
        try {
          session.metadata = new MediaMetadata({
            title: item.title,
            artist: item.artist ?? "Unknown Artist",
            album: item.description ?? undefined,
            artwork: item.artworkUrl
              ? [
                  {
                    src: item.artworkUrl,
                    sizes: "512x512",
                    type: "image/png",
                  },
                ]
              : [],
          });
        } catch {
          session.metadata = null;
        }
      } else {
        session.metadata = null;
      }
    }

    session.playbackState = item
      ? state.isPlaying
        ? "playing"
        : "paused"
      : "none";

    const position = Math.floor(state.position);
    if (
      item &&
      state.duration > 0 &&
      typeof session.setPositionState === "function" &&
      Math.abs(position - lastPosition) >= 0.5
    ) {
      lastPosition = position;
      try {
        session.setPositionState({
          duration: state.duration,
          playbackRate: state.speed,
          position,
        });
      } catch {
        // setPositionState may throw when metadata is not yet attached.
      }
    }
  });

  return unsubscribe;
}
