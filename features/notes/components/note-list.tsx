"use client";

import { StickyNote } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import type { Note } from "../types";
import { NoteCard } from "./note-card";

export interface NoteListProps {
  notes: Note[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onOpen?: (note: Note) => void;
  onDelete?: (note: Note) => void;
}

/**
 * NoteList — the responsive note grid + loading/error/empty states.
 * Presentational; the filtered/sorted list comes from `useNoteLibrary`.
 */
export function NoteList({
  notes,
  isLoading,
  isError,
  onRetry,
  onOpen,
  onDelete,
}: NoteListProps) {
  if (isLoading) {
    return <LoadingState label="Loading notes…" />;
  }
  if (isError) {
    return (
      <ErrorState
        title="Couldn't load your notes"
        description="Something went wrong while reading your notes. Please try again."
        onRetry={onRetry}
      />
    );
  }
  if (notes.length === 0) {
    return (
      <EmptyState
        icon={StickyNote}
        title="No notes yet"
        description="Create your first note with the New Note button."
      />
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onOpen={onOpen}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
