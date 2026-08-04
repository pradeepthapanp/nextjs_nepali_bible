/**
 * Audio Bible model. Mirrors the Flutter `BibleAudio` model
 * (`lib/models/bible_audio.dart`).
 */

export interface BibleAudio {
  id: string;
  bookNumber: number;
  chapter: number;
  shortName: string;
  longName: string;
  audioUrl: string;
  createdAt?: string;
}
