/**
 * AudioItem — the generic, feature-agnostic item the shared Audio Platform
 * plays. It is the web replacement for the `MediaItem` tag Flutter attaches to
 * every `just_audio` source (`lib/providers/audio/audio_mapper.dart`) and for
 * the fields both `Audio.toAudioSource()` and `BibleAudio.toAudioSource()` set:
 *
 *   AudioItem field   ←  MediaItem field set by the Flutter mappers
 *   id                ←  id
 *   title             ←  title
 *   artist            ←  artist
 *   description       ←  displayDescription
 *   audioUrl          ←  the `AudioSource.uri` URL
 *   artworkUrl        ←  artUri
 *   meta              ←  the extra tags Flutter smuggled into MediaItem
 *                        genre / album / displaySubtitle (e.g. bible
 *                        bookNumber + chapter). Opaque to the player.
 *
 * The platform knows NOTHING about Songs, Bible chapters or Podcasts — it only
 * consumes `AudioItem`s. Consumers (Online Songs, Audio Bible, Podcasts) map
 * their own models into `AudioItem`s before handing them to the player.
 */
export interface AudioItem {
  id: string;
  title: string;
  artist?: string;
  description?: string;
  /** Absolute or relative audio URL played by the HTML5 <audio> element. */
  audioUrl: string;
  /** Cover/artwork URL (optional; the player shows a placeholder fallback). */
  artworkUrl?: string;
  /** Opaque consumer metadata (e.g. `{ bookNumber, chapter }`). */
  meta?: Record<string, unknown>;
}
