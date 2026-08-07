"use client";

import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { useSearchStore } from "../../store";
import { useSearchHistory } from "../hooks";

/**
 * SearchBar — the query field for the search page.
 *
 * Reuses the design-system `SearchInput` (label, leading icon, clear button);
 * the parent owns query state via `useSearchStore`, so instant search is just
 * the store + the feature's debounce. Enter commits the query to history.
 */
export function SearchBar() {
  const query = useSearchStore((state) => state.query);
  const setQuery = useSearchStore((state) => state.setQuery);
  const commit = useSearchHistory().commit;

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commit(query);
    }
  };

  return (
    <SearchInput
      label="बाइबल खोज्नुहोस्"
      placeholder="बाइबल खोज्नुहोस्… (जस्तै: faith, प्रेम)"
      value={query}
      onValueChange={setQuery}
      onClear={() => setQuery("")}
      onKeyDown={handleKeyDown}
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      autoFocus
    />
  );
}
