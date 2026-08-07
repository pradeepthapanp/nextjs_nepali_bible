"use client";

import { useEffect } from "react";
import { useAudioKeyboardShortcuts } from "../hooks";
import { bindMediaSession, getAudioEngine } from "../services";
import { MiniAudioPlayer } from "./mini-audio-player";

/**
 * AudioPlayerHost — the single mount point of the shared Audio Platform. It
 * wires the app-wide behaviors ONCE (the web assembly of Flutter's
 * `audioPlayerProvider` audio-session configuration + `just_audio_background`
 * notification wiring + the keyboard controls) and renders the floating
 * `MiniAudioPlayer` bottom bar:
 *   - binds the Media Session API to the engine (system play/pause/next/
 *     previous/seek/stop + lock-screen metadata);
 *   - registers the global keyboard shortcuts (Space, ←/→, n/p);
 *   - renders `MiniAudioPlayer` (returns nothing until a queue is loaded).
 *
 * Consumers (Online Songs, Audio Bible, Podcasts) mount this once — e.g. in a
 * feature shell or the app layout — and just call `playQueue(...)`.
 */
export function AudioPlayerHost() {
  // Bind the Media Session bridge once (client-only; the hook no-ops on SSR).
  useEffect(() => bindMediaSession(getAudioEngine()), []);

  useAudioKeyboardShortcuts();

  return <MiniAudioPlayer />;
}
