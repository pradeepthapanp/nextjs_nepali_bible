/**
 * Bible Search feature — feature-scoped types.
 *
 * The shared search domain types (`SearchResult`, `SearchFilters`,
 * `SearchTestament`, `SearchPriority`) live in `features/bible/types`; this
 * module only adds the search-feature concerns: match mode, version scope,
 * history entries and suggestions.
 */

/** How the query is matched against verse text. */
export type SearchMatchMode = "partial" | "phrase" | "word";

/** Which versions the search covers. */
export type SearchVersionScope = "current" | "all";

/** One entry in the (persisted) search history. */
export interface SearchHistoryEntry {
  query: string;
  /** When the search was committed (epoch ms). */
  timestamp: number;
}

/** A quick-search suggestion chip. */
export interface SearchSuggestion {
  /** Text shown on the chip. */
  label: string;
  /** Query the chip runs. */
  query: string;
}
