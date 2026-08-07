/**
 * Song categories — a direct port of the Flutter `SongCategory` enum
 * (`lib/helpers/enums.dart`).
 *
 * - `all` is a FILTER sentinel (the horizontal category chips in the song
 *   list); no song ever has `category === "all"`.
 * - `others` is the special value for artist-linked songs: their list row
 *   shows the artist's photo (via `SongAvatar`) instead of a song number, and
 *   the reader title falls back to the artist name.
 *
 * Category helpers (`isOthersCategory`, `categoryLabel`, `categoryOrder`,
 * `isSongCategory`) live in `features/music/utils/category.ts` so this
 * module stays types-only.
 */
export type SongCategoryName = "bhajan" | "chorus" | "kids" | "others";

/** Filter sentinel union: a concrete song category, or `all`. */
export type SongCategory = SongCategoryName | "all";
