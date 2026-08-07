"use client";

import { AudioPlayerHost, useAudioPlayerStore } from "@features/audio";

/**
 * GlobalAudioPlayer — the app-wide mount of the shared Audio Platform.
 * Mounted ONCE in the root layout so the floating MiniAudioPlayer appears on
 * EVERY page while audio is playing (previously each feature page mounted its
 * own `AudioPlayerHost`, so the mini player vanished as soon as you navigated
 * away from that page).
 *
 * Renders the `AudioPlayerHost` (media-session bridge + keyboard shortcuts +
 * the fixed MiniAudioPlayer) and, while a track is loaded, a bottom spacer
 * that clears page content above the fixed bar so nothing is hidden behind it.
 */
export function GlobalAudioPlayer() {
  const hasCurrentItem = useAudioPlayerStore(
    (state) => state.currentItem !== null,
  );

  return (
    <>
      <AudioPlayerHost />
      {hasCurrentItem ? <div aria-hidden className="h-16" /> : null}
    </>
  );
}
