import type { AudioItem } from "@features/audio";
import type { BibleAudio } from "../types";
import { toNepaliDigits } from "./nepali-numbers";

/**
 * Maps a `BibleAudio` track into the shared Audio Platform's generic
 * `AudioItem` — the web equivalent of Flutter's `BibleAudio.toAudioSource()`
 * (`lib/providers/audio/audio_mapper.dart`, which set a `MediaItem` tag).
 * This is the ONLY place the Audio Bible couples to the platform: the
 * platform itself knows nothing about Bible chapters.
 */
export function toBibleAudioItem(track: BibleAudio): AudioItem {
  return {
    id: track.id,
    title: `${track.longName} ${toNepaliDigits(track.chapter)}`,
    audioUrl: track.audioUrl,
    meta: { bookNumber: track.bookNumber, chapter: track.chapter },
  };
}

/** Maps a whole book's tracks (keeps the chapter order + index alignment). */
export function toBibleAudioItems(tracks: BibleAudio[]): AudioItem[] {
  return tracks.map(toBibleAudioItem);
}
