/**
 * Audio — an online song / audio library item, a direct port of the Flutter
 * `Audio` model (`lib/models/audio.dart`, Supabase `audios` table).
 *
 * Column mapping (snake_case → camelCase):
 *   id, title, artist, description, audio_url → audioUrl,
 *   art_url → artUrl, category, play_count → playCount,
 *   uploaded_by → uploadedBy, created_at → createdAt, updated_at → updatedAt.
 *
 * NOTE: there is no `duration` column (Flutter shows play count instead);
 * the only duration available is the live one from the shared Audio Platform
 * for the currently-playing item (shown on that card).
 */
export interface Audio {
  id: string;
  title: string;
  artist?: string;
  description?: string;
  audioUrl: string;
  artUrl?: string;
  category?: string;
  playCount: number;
  uploadedBy?: string;
  /** ISO timestamp. */
  createdAt: string;
  /** ISO timestamp. */
  updatedAt: string;
}
