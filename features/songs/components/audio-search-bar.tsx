"use client";

import { SearchInput } from "@/components/ui/search-input";

export interface AudioSearchBarProps {
  value: string;
  onValueChange?: (value: string) => void;
  onClear?: () => void;
  className?: string;
}

/**
 * AudioSearchBar — the audio library search field. Reuses the shared
 * `SearchInput` primitive (leading icon, accessible label, clear button) — no
 * input logic is duplicated. Filtering is client-side via `audioMatchesQuery`.
 */
export function AudioSearchBar({
  value,
  onValueChange,
  onClear,
  className,
}: AudioSearchBarProps) {
  return (
    <SearchInput
      label="Search audios"
      value={value}
      onValueChange={onValueChange}
      onClear={onClear}
      placeholder="Search audios…"
      className={className}
    />
  );
}
