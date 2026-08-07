"use client";

import { SearchInput } from "@/components/ui/search-input";
import { cn } from "@/utils/cn";

export interface MapSearchBarProps {
  value: string;
  onValueChange: (value: string) => void;
  onClear?: () => void;
  /** Placeholder, e.g. `Search {topic}...` (Flutter's hint text). */
  placeholder?: string;
  className?: string;
}

/**
 * MapSearchBar — the maps-list search input (the web replacement of the
 * `TextField` in `MapsDetailView`). A thin wrapper over the SHARED
 * `SearchInput` (leading icon + clear button) — the query state lives in the
 * page via `useMapSearch`; no search logic is duplicated here.
 */
export function MapSearchBar({
  value,
  onValueChange,
  onClear,
  placeholder = "Search maps...",
  className,
}: MapSearchBarProps) {
  return (
    <SearchInput
      label="Search maps"
      value={value}
      onValueChange={onValueChange}
      onClear={onClear}
      placeholder={placeholder}
      className={cn(className)}
    />
  );
}
