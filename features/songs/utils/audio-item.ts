import type { AudioItem } from "@features/audio";
import type { Audio } from "../types";

/**
 * Maps an `Audio` (Online Songs model) into the shared Audio Platform's
 * generic `AudioItem` — the web equivalent of Flutter's
 * `Audio.toAudioSource()` (`lib/providers/audio/audio_mapper.dart`, which set
 * a `MediaItem` tag). This is the ONLY place the feature couples to the
 * platform: the platform itself knows nothing about `Audio`.
 */
export function toAudioItem(audio: Audio): AudioItem {
  return {
    id: audio.id,
    title: audio.title,
    artist: audio.artist,
    description: audio.description,
    audioUrl: audio.audioUrl,
    artworkUrl: audio.artUrl,
    meta: { audioId: audio.id },
  };
}

/** Maps a whole list (keeps the queue order + index alignment). */
export function toAudioItems(audios: Audio[]): AudioItem[] {
  return audios.map(toAudioItem);
}

/**
 * Client-side search predicate (a web refinement — the Flutter audio list has
 * no search). Matches title / artist / category / description case-insensitively.
 */
export function audioMatchesQuery(audio: Audio, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [audio.title, audio.artist, audio.category, audio.description]
    .filter((value): value is string => Boolean(value))
    .some((value) => value.toLowerCase().includes(q));
}

/**
 * Client-side category filter (a web refinement — the Flutter audio list has
 * no category filter; `fetchAudioCategories` exists server-side).
 */
export function audioMatchesCategory(
  audio: Audio,
  category: string | null,
): boolean {
  if (!category || category === "all") return true;
  return audio.category === category;
}
