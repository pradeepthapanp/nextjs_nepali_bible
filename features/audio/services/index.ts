import { AudioEngine } from "./audio-engine";

export * from "./audio-engine";
export * from "./media-session";

/**
 * The app-wide audio engine singleton (the web equivalent of the Flutter
 * `audioPlayerProvider` — one shared `AudioPlayer`/`<audio>` element that every
 * feature's playback flows through, so MiniAudioPlayer / Media Session always
 * reflect the currently playing item). Lazily created; DOM-guarded for SSR.
 */
let engine: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  if (!engine) engine = new AudioEngine();
  return engine;
}
