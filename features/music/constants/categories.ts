import type { SongCategory, SongCategoryName } from "../types";

/**
 * Song categories — a direct port of the Flutter `SongCategory` enum
 * (`lib/helpers/enums.dart`). The `all` sentinel drives the horizontal
 * filter chips in the song list; `SONG_CATEGORY_NAMES` is the list of
 * concrete categories (used to render chips and validate song rows).
 */
export const SONG_CATEGORIES: readonly SongCategory[] = [
  "all",
  "bhajan",
  "chorus",
  "kids",
  "others",
];

/** Concrete song categories (never includes the `all` filter sentinel). */
export const SONG_CATEGORY_NAMES: readonly SongCategoryName[] = [
  "bhajan",
  "chorus",
  "kids",
  "others",
];
