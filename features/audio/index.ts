/**
 * The shared Audio Player Platform — a feature-agnostic playback layer reused
 * by Online Songs, the Audio Bible and future Podcasts.
 *
 *   types/      AudioItem + RepeatMode + PlayerSnapshot + playback constants
 *   services/   AudioEngine (HTML5 <audio> queue engine) + Media Session bridge
 *   store/      useAudioPlayerStore — the reactive projection of the engine
 *   hooks/      useAudioPlayer (behavior API) + useAudioKeyboardShortcuts
 *   components/ MiniAudioPlayer, FullAudioPlayer, AudioPlayerHost + primitives
 *
 * Import the whole surface from `@features/audio` (or sub-barrels).
 */

export * from "./types";
export * from "./services";
export * from "./store";
export * from "./hooks";
export * from "./components";
