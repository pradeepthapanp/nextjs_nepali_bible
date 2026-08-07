import type { SongCategoryName } from "./category";

/**
 * A local hymn / song — a direct port of the Flutter `Music` model
 * (`lib/models/music.dart`, Supabase `songs` table).
 *
 * Column mapping (snake_case → camelCase):
 *   id, name, artist, artist_id → artistId, audio_url → audioUrl,
 *   description, nepali_lyrics → nepaliLyrics, roman_lyrics → romanLyrics,
 *   translit_lyrics → translitLyrics, main_chords → mainChords, beat,
 *   song_number → songNumber, category, last_updated → lastUpdated.
 *
 * Notes:
 * - "Roman lyrics" in the UI is `translitLyrics` (the NP/EN language toggle in
 *   `LyricsLanguage` maps np → `nepaliLyrics`, en → `translitLyrics`); the
 *   separate `romanLyrics` column is kept on the model for completeness.
 * - `category` is a free-form string in the data but only the enum values are
 *   meaningful; the special value `"others"` marks artist-linked songs.
 * - `audioUrl` is kept because it is part of the row, but online/streaming
 *   audio playback is OUT OF SCOPE for this module.
 * - `lastUpdated` is kept as an ISO string (the web equivalent of Flutter's
 *   `DateTime`), used for admin update conflict handling.
 */
export interface Song {
  id: string;
  name?: string;
  artist?: string;
  artistId?: string;
  audioUrl?: string;
  description?: string;
  nepaliLyrics?: string;
  romanLyrics?: string;
  translitLyrics?: string;
  mainChords?: string;
  beat?: string;
  songNumber?: string;
  category?: SongCategoryName;
  lastUpdated?: string;
}
