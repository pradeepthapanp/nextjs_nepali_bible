import type { SearchPriority, SearchTestament } from "../types";

/** Minimum query length before a search runs (prevents noisy queries). */
export const SEARCH_MIN_QUERY_LENGTH = 2;

/** Default number of results returned per search. */
export const SEARCH_DEFAULT_LIMIT = 50;

/** Search testament scopes (mirrors the Flutter `SearchTestamentType`). */
export const SEARCH_TESTAMENTS: SearchTestament[] = ["all", "ot", "nt"];

/** Search priority options (mirrors the Flutter `SearchResultPriority`). */
export const SEARCH_PRIORITIES: SearchPriority[] = ["nepali", "english"];

/** Default result limit (the commented-out Flutter search used `maxResults = 100`). */
export const SEARCH_MAX_RESULTS = 100;

/** Infinite-scroll page size (each "load more" fetches this many rows). */
export const SEARCH_PAGE_SIZE = SEARCH_DEFAULT_LIMIT;
