import type { SearchSuggestion } from "../types";

/**
 * Quick-search suggestions — shown on the empty search state. Ports the
 * Flutter suggestions (`search_verses.dart`: 'John 3:16', 'Psalm 23',
 * 'Love', 'Faith') and adds a few Nepali ones.
 */
export const DEFAULT_SEARCH_SUGGESTIONS: SearchSuggestion[] = [
  { label: "यूहन्ना ३:१६", query: "John 3:16" },
  { label: "भजन २३", query: "Psalm 23" },
  { label: "प्रेम", query: "प्रेम" },
  { label: "विश्वास", query: "विश्वास" },
  { label: "आशा", query: "आशा" },
  { label: "शान्ति", query: "शान्ति" },
];

/** Filters suggestions whose label/query contains the typed prefix. */
export function filterSuggestions(
  suggestions: SearchSuggestion[],
  prefix: string,
): SearchSuggestion[] {
  const q = prefix.trim().toLocaleLowerCase("ne");
  if (!q) return suggestions;
  return suggestions.filter(
    (suggestion) =>
      suggestion.label.toLocaleLowerCase("ne").includes(q) ||
      suggestion.query.toLocaleLowerCase("ne").includes(q),
  );
}
