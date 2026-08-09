"use client";

import { SearchInput } from "@/components/ui/search-input";

export interface NoteSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

/** Note search — wraps the shared `SearchInput` (client-side filter). */
export function NoteSearchBar({ value, onChange }: NoteSearchBarProps) {
  return (
    <SearchInput
      value={value}
      onValueChange={onChange}
      onClear={() => onChange("")}
      placeholder="Search notes…"
      label="Search notes"
    />
  );
}
