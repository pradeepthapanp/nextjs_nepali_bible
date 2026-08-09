"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import type { Note } from "../types";
import { noteColorToCss, noteToPlainText } from "../utils";

export interface NoteCardProps {
  note: Note;
  onOpen?: (note: Note) => void;
  onDelete?: (note: Note) => void;
  className?: string;
}

/**
 * NoteCard — the note list card (the web equivalent of the Flutter
 * `NotesPage` list tile): a colour accent bar (from `note.color`), the title,
 * a 2-line plain-text preview of the HTML description, the category badge and
 * a delete button. Presentational — data + callbacks only.
 */
export function NoteCard({ note, onOpen, onDelete, className }: NoteCardProps) {
  const color = noteColorToCss(note.color);
  const preview = noteToPlainText(note.description);

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-colors hover:border-border/80",
        className,
      )}
    >
      {color ? (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-1.5"
          style={{ backgroundColor: color }}
        />
      ) : null}

      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpen?.(note)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpen?.(note);
          }
        }}
        className="flex-1 cursor-pointer rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <h3 className="truncate text-base font-bold">{note.title}</h3>
        {preview ? (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {preview}
          </p>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        {note.category ? (
          <span
            className="rounded-md px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
            style={
              color
                ? { backgroundColor: `${color}22`, color: "inherit" }
                : undefined
            }
          >
            {note.category}
          </span>
        ) : (
          <span />
        )}
        {onDelete ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
            aria-label={`Delete ${note.title}`}
            onClick={() => onDelete(note)}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
