"use client";

import { Clock, History, Sparkles, X } from "lucide-react";
import { useSearchStore } from "../../store";
import { useSearchHistory, useSearchSuggestions } from "../hooks";

/**
 * SearchSuggestions — the pre-results state: quick-search chips (port of the
 * Flutter suggestions) plus the persisted recent searches. Selecting either
 * runs the query through `useSearchStore`, which drives instant search.
 */
export function SearchSuggestions() {
  const query = useSearchStore((state) => state.query);
  const setQuery = useSearchStore((state) => state.setQuery);
  const { entries, remove, clear } = useSearchHistory();
  const suggestions = useSearchSuggestions(query);

  return (
    <div className="space-y-6">
      {suggestions.length > 0 ? (
        <section aria-label="खोज सुझावहरू" className="space-y-2">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
            <Sparkles className="size-4" aria-hidden />
            सुझावहरू
          </h2>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.query}
                type="button"
                onClick={() => setQuery(suggestion.query)}
                className="rounded-full border bg-muted/40 px-3.5 py-1.5 text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {entries.length > 0 ? (
        <section aria-label="भर्खरै खोजिएका" className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
              <History className="size-4" aria-hidden />
              भर्खरै खोजिएका
            </h2>
            <button
              type="button"
              onClick={clear}
              className="text-xs text-muted-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              सबै मेट्नुहोस्
            </button>
          </div>
          <ul className="divide-y rounded-xl border bg-background/60">
            {entries.map((entry) => (
              <li key={entry.query} className="flex items-center gap-2 px-3">
                <Clock className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <button
                  type="button"
                  onClick={() => setQuery(entry.query)}
                  className="flex-1 truncate py-2.5 text-left text-sm text-foreground hover:underline focus-visible:outline-none"
                >
                  {entry.query}
                </button>
                <button
                  type="button"
                  onClick={() => remove(entry.query)}
                  aria-label={`"${entry.query}" हटाउनुहोस्`}
                  className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {entries.length === 0 && suggestions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          माथि लेखेर बाइबल खोज्नुहोस् — कम्तीमा २ अक्षर टाइप गर्नुहोस्।
        </p>
      ) : null}
    </div>
  );
}
