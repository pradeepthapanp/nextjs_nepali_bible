import type { Testament } from "./reference";

/**
 * A canonical Bible book. Mirrors the Flutter `BookNameNP` model
 * (`lib/models/book_name_np.dart`). Books are version-independent; the same
 * canonical list is used across every Bible version.
 */
export interface Book {
  /** Canonical book number (1..66). */
  bookNumber: number;
  /** Nepali short name (e.g. "उत"). */
  shortName: string;
  /** Nepali long name (e.g. "उत्पत्ति"). */
  longName: string;
  /** English short name (e.g. "Gen"). */
  engShortName: string;
  /** English long name (e.g. "Genesis"). */
  engLongName: string;
  /** Number of chapters in the book. */
  chapters: number;
  testament: Testament;
}
