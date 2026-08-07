import type { Book } from "./book";
import type { Verse } from "./verse";
import type { BibleVersion } from "./bible-version";

/** Search scopes — mirrors the Flutter `SearchTestamentType` enum. */
export type SearchTestament = "all" | "ot" | "nt";

/**
 * Search prioritization — mirrors the Flutter `SearchResultPriority` enum
 * (`{ english, nepali }`): which language's table is searched first.
 */
export type SearchPriority = "nepali" | "english";

/** Filters applied to a verse search. */
export interface SearchFilters {
  versionId?: string;
  testament?: SearchTestament;
  language?: "ne" | "en";
  priority?: SearchPriority;
  limit?: number;
  /** Pagination offset (number of already-loaded rows); for infinite scroll. */
  offset?: number;
  /** Search every Bible version instead of only the selected one. */
  allVersions?: boolean;
  /** Restrict results to a single book. */
  bookNumber?: number;
}

/** One verse match. */
export interface SearchResult {
  verse: Verse;
  /** Version the match came from. */
  version: BibleVersion;
  /** Book metadata for display. */
  book: Book;
  /** Snippet with the matched range highlighted by the caller/parser. */
  snippet: string;
  /** Simple relevance score (higher = better) for ordering. */
  score: number;
}
