import type { Verse, VerseTitle } from "./verse";

/** A book+chapter pointer used for navigation edges. */
export interface ChapterReference {
  bookNumber: number;
  chapter: number;
}

/**
 * A full chapter: its verses and any section titles for the selected version.
 * Fetched by `useChapter`; used by the future ChapterViewer.
 */
export interface Chapter {
  versionId: string;
  bookNumber: number;
  chapter: number;
  verses: Verse[];
  titles: VerseTitle[];
  /** Navigation edges for infinite chapter navigation (derived via reference-math). */
  prev?: ChapterReference;
  next?: ChapterReference;
}
