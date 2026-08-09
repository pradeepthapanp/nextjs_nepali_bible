"use client";

import { NOTE_SORT_OPTIONS, type NoteSort } from "../constants";

export interface NoteSortMenuProps {
  value: NoteSort;
  onChange: (sort: NoteSort) => void;
}

/** Note sort select (Latest / Oldest / Alphabetical — Flutter `NotesSort`). */
export function NoteSortMenu({ value, onChange }: NoteSortMenuProps) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as NoteSort)}
      aria-label="Sort notes"
      className="h-8 rounded-lg border border-input bg-transparent px-2 text-xs font-medium text-foreground [color-scheme:light] dark:[color-scheme:dark] [&>option]:bg-background [&>option]:text-foreground"
    >
      {NOTE_SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
