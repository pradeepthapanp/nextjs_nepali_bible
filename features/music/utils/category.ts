import { SONG_CATEGORIES } from "../constants";
import type { SongCategory, SongCategoryName } from "../types";
import { capitalizeWords } from "./capitalize";

/**
 * Category helpers — pure functions over `SongCategory`/`SongCategoryName`.
 * (`isOthersCategory` moved here from `types/category.ts` so the types module
 * stays types-only.)
 */

/** True when the song is an artist-linked `others` song. */
export function isOthersCategory(category?: string): boolean {
  return category === "others";
}

/** Type guard: is the raw string a valid `SongCategory` (incl. `all`)? */
export function isSongCategory(value: string): value is SongCategory {
  return (SONG_CATEGORIES as readonly string[]).includes(value);
}

/** Type guard: is the raw string a concrete song category (excl. `all`)? */
export function isSongCategoryName(value: string): value is SongCategoryName {
  return value !== "all" && isSongCategory(value);
}

/**
 * Display label for a song category — a direct port of the reader's
 * `category?.capitalizeWords()` ("bhajan" → "Bhajan").
 */
export function categoryLabel(category: SongCategoryName | string): string {
  return capitalizeWords(category);
}

/**
 * Stable ordering index for the category chips (the order of
 * `SONG_CATEGORIES`: all, bhajan, chorus, kids, others). Unknown categories
 * sort last.
 */
export function categoryOrder(category: SongCategory): number {
  const index = SONG_CATEGORIES.indexOf(category);
  return index === -1 ? SONG_CATEGORIES.length : index;
}
