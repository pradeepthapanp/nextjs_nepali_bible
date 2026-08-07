import type { SearchMatchMode } from "../types";

/**
 * Query normalization for the search feature.
 *
 * The shared search service always runs a case-insensitive substring match
 * (`ilike "%q%"`). This module layers the three match modes on top:
 *   - `partial` — substring (default; the service already does this).
 *   - `phrase`  — the query is treated as one exact phrase; surrounding quotes
 *     are stripped before hitting the service.
 *   - `word`    — substring search + a client-side whole-word filter (the
 *     service cannot express word boundaries).
 */

/** Removes surrounding double quotes (exact-phrase input) and trims. */
export function normalizeSearchQuery(query: string): string {
  return query.trim().replace(/^"(.*)"$/, "$1").trim();
}

/** Word characters: Latin letters/digits plus Devanagari. */
const WORD_CHARS = "A-Za-z0-9\\u0900-\\u097F";

/**
 * Returns true when `query` occurs as a whole word inside `text`
 * (not as a substring of a larger word).
 */
export function matchesWholeWord(text: string, query: string): boolean {
  const normalized = normalizeSearchQuery(query);
  if (!normalized) return false;
  const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = `(^|[^${WORD_CHARS}])${escaped}(?=$|[^${WORD_CHARS}])`;
  return new RegExp(pattern, "i").test(text);
}

/**
 * Applies the match mode to a result list:
 *   - `word` filters to whole-word matches; the other modes pass through
 *     (the service already does substring / phrase matching).
 */
export function applyMatchMode<T extends { verse: { text: string } }>(
  results: T[],
  query: string,
  mode: SearchMatchMode,
): T[] {
  if (mode === "word") {
    return results.filter((result) =>
      matchesWholeWord(result.verse.text, query),
    );
  }
  return results;
}
