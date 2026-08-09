import type { SearchFilters } from "../types";

/**
 * Central React Query cache keys for the Bible feature. Hierarchical keys let
 * mutations invalidate whole families (e.g. all highlights) with one call.
 * The single source of cache identity — hooks never invent keys inline.
 */
export const bibleKeys = {
  all: ["bible"] as const,

  versions: () => [...bibleKeys.all, "versions"] as const,
  version: (id: string) => [...bibleKeys.versions(), id] as const,

  books: () => [...bibleKeys.all, "books"] as const,

  chapter: (versionId: string, bookNumber: number, chapter: number) =>
    [...bibleKeys.all, "chapter", versionId, bookNumber, chapter] as const,

  verse: (versionId: string, uuid: string) =>
    [...bibleKeys.all, "verse", versionId, uuid] as const,

  verseByReference: (
    versionId: string,
    bookNumber: number,
    chapter: number,
    verse: number,
  ) =>
    [...bibleKeys.all, "verse-ref", versionId, bookNumber, chapter, verse] as const,

  crossReferences: (bookNumber: number, chapter: number) =>
    [...bibleKeys.all, "cross-references", bookNumber, chapter] as const,
  resolvedCrossReferences: (versionId: string) =>
    [...bibleKeys.all, "cross-references", "resolved", versionId] as const,

  /** English NIV parallel verses for a chapter (whole chapter, one query). */
  englishVerses: (bookNumber: number, chapter: number) =>
    [...bibleKeys.all, "english-verses", bookNumber, chapter] as const,

  commentary: (commentaryId: string, bookNumber: number, chapter: number) =>
    [...bibleKeys.all, "commentary", commentaryId, bookNumber, chapter] as const,
  commentaryVersions: () => [...bibleKeys.all, "commentaries"] as const,
  commentaryHasContent: (commentaryId: string) =>
    [...bibleKeys.all, "commentaries", commentaryId, "has-content"] as const,
  versionHasVerses: (versionId: string) =>
    [...bibleKeys.versions(), versionId, "has-verses"] as const,

  search: (query: string, filters: SearchFilters) =>
    [...bibleKeys.all, "search", query, filters] as const,
  searchInfinite: (query: string, filters: SearchFilters) =>
    [...bibleKeys.all, "search", "infinite", query, filters] as const,

  highlights: {
    all: () => [...bibleKeys.all, "highlights"] as const,
  },

  audio: (bookNumber: number, chapter: number) =>
    [...bibleKeys.all, "audio", bookNumber, chapter] as const,
  bookAudio: (bookNumber: number) =>
    [...bibleKeys.all, "audio", bookNumber] as const,

  progress: () => [...bibleKeys.all, "progress"] as const,

  bookmarks: {
    all: () => [...bibleKeys.all, "bookmarks"] as const,
  },

  dictionary: (term: string) =>
    [...bibleKeys.all, "dictionary", term] as const,
} as const;
