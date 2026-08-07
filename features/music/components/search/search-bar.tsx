"use client";

import { SearchInput } from "@/components/ui/search-input";

export interface SearchBarProps {
  value: string;
  onValueChange?: (value: string) => void;
  onClear?: () => void;
  /** Fired on Enter (used to commit the query to a deep link). */
  onSubmit?: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

/**
 * SearchBar — the song search field (the web equivalent of the search
 * `TextField` in `music_display.dart`). Reuses the shared `SearchInput`
 * primitive (leading icon, accessible label, clear button) — no generic
 * input logic is duplicated. Query state/debounce live in `useSongSearch`;
 * `onSubmit` lets the parent commit the query to a deep link on Enter.
 */
export function SearchBar({
  value,
  onValueChange,
  onClear,
  onSubmit,
  label = "Search songs",
  placeholder = "Search songs…",
  className,
}: SearchBarProps) {
  return (
    <SearchInput
      label={label}
      value={value}
      onValueChange={onValueChange}
      onClear={onClear}
      placeholder={placeholder}
      onKeyDown={(event) => {
        if (event.key === "Enter") onSubmit?.(value);
      }}
      className={className}
    />
  );
}
