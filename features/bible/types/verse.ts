/**
 * Verse + verse-title models. Mirrors the Flutter `Ver` and `VerseTitle`
 * models (`lib/models/ver_model.dart`, `lib/models/verse_title.dart`).
 */

export interface Verse {
  /** Row UUID in the version's verses table (`bible_verses_*`). */
  uuid: string;
  bookNumber: number;
  chapter: number;
  verse: number;
  text: string;
  /** Inclusive end for multi-verse segments (e.g. "१-२"); omitted for single verses. */
  verseEnd?: number;
}

/**
 * A section heading that belongs to (or precedes) a verse in a chapter
 * (e.g. "परमेश्वरले संसार सृष्टि गर्नुभयो").
 */
export interface VerseTitle {
  bookNumber: number;
  chapter: number;
  verse: number;
  /** Ordering when several titles share the same verse. */
  orderIfSeveral: number;
  title: string;
}
