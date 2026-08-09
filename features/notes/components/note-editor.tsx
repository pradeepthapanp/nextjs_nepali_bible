"use client";

import { HtmlEditor } from "@/components/editor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils/cn";
import {
  NOTE_CATEGORIES,
  NOTE_COLORS,
  NOTE_IMAGE_UPLOAD_FOLDER,
} from "../constants";
import { getNoteServices } from "../services";
import { hexToArgbString, noteColorToCss } from "../utils";

export interface NoteEditorProps {
  title: string;
  category: string;
  /** Stored colour (Flutter ARGB-int string). */
  color: string;
  /** The note body as HTML. */
  description: string;
  onTitleChange?: (title: string) => void;
  onCategoryChange?: (category: string) => void;
  onColorChange?: (color: string) => void;
  onDescriptionChange?: (html: string) => void;
  /** Debounced HTML autosave (the shared editor platform's `AutoSaveManager`). */
  onAutoSave?: (html: string) => void;
  className?: string;
}

/**
 * NoteEditor — the note create/edit form: title, category chips, colour
 * swatches and the SHARED WYSIWYG editor (`HtmlEditor` from
 * `@/components/editor` — the same Quill platform Articles uses). It supplies
 * the notes wiring: the SHARED `UploadService` + the `notes` image folder.
 * Presentational — field changes are reported via callbacks; the page owns the
 * draft state (`useNoteEditor`).
 */
export function NoteEditor({
  title,
  category,
  color,
  description,
  onTitleChange,
  onCategoryChange,
  onColorChange,
  onDescriptionChange,
  onAutoSave,
  className,
}: NoteEditorProps) {
  const selectedCss = noteColorToCss(color);

  return (
    <div className={cn("space-y-5", className)}>
      <div className="space-y-2">
        <Label htmlFor="note-title">Title</Label>
        <Input
          id="note-title"
          value={title}
          onChange={(event) => onTitleChange?.(event.target.value)}
          placeholder="Note title"
        />
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <div role="group" aria-label="Note category" className="flex flex-wrap gap-1.5">
          {NOTE_CATEGORIES.map((noteCategory) => {
            const active = category === noteCategory;
            return (
              <button
                key={noteCategory}
                type="button"
                onClick={() => onCategoryChange?.(noteCategory)}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {noteCategory}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Colour</Label>
        <div role="group" aria-label="Note colour" className="flex flex-wrap gap-2">
          {NOTE_COLORS.map((hex) => {
            const active =
              selectedCss?.toLowerCase() === hex.toLowerCase();
            return (
              <button
                key={hex}
                type="button"
                onClick={() => onColorChange?.(hexToArgbString(hex))}
                aria-label={`Colour ${hex}`}
                aria-pressed={active}
                className={cn(
                  "size-8 rounded-full border border-border transition-shadow",
                  active && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                )}
                style={{ backgroundColor: hex }}
              />
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Content</Label>
        <HtmlEditor
          value={description}
          onChange={onDescriptionChange ?? (() => undefined)}
          onAutoSave={onAutoSave}
          autosaveDebounceMs={800}
          upload={getNoteServices().upload}
          imageUploadFolder={NOTE_IMAGE_UPLOAD_FOLDER}
          placeholder="Write your note…"
        />
      </div>
    </div>
  );
}
