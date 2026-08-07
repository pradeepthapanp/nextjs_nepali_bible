import type { LyricsLanguage } from "./lyrics";

/**
 * Song Reader display settings — the web equivalent of the Flutter state
 * that drives the lyrics/chord surface:
 *
 * - `fontSize` — Flutter global `settingsProvider` (`setFontSize`, persisted
 *   under `settings_v2`), read by `CustomChordWidget`.
 * - `lyricsLanguage` — `LyricsLanguageNotifier` (default `np`).
 * - `showChords` — `ChordsNotifier` (default `true`).
 * - `transpose` — `ChordsTransposeNotifier` (default `0`, ±1 steps, no clamp
 *   in Flutter; the web clamps to a chromatic octave — see
 *   `constants/chords.ts`).
 *
 * The persisted Zustand store contract lives in
 * `features/music/store/song-settings-store.ts`; this type is the data shape
 * only, so the store, hooks and components share one definition.
 */
export interface SongReaderSettings {
  fontSize: number;
  lyricsLanguage: LyricsLanguage;
  showChords: boolean;
  transpose: number;
}
