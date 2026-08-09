"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AuthGate } from "@features/auth";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { NOTE_LIST_PATH } from "../constants";
import { useNoteEditor } from "../hooks";
import { useDeleteNote, useNote } from "../queries";
import { NoteEditor } from "./note-editor";

export interface AddEditNotePageProps {
  /** Present in edit mode (the route `/notes/edit/{id}`). */
  id?: string;
}

/**
 * AddEditNotePage — the note create/edit form (the web replacement of
 * `AddEditNotePage` in `lib/notes/add_edit_note.dart`). Compose-only:
 *   - `AuthGate` — protected (user-owned notes);
 *   - `useNote(id)` — the note being edited (seeded into the draft);
 *   - `useNoteEditor(note)` — the draft/autosave store + create/update save;
 *   - `NoteEditor` — the form (SHARED WYSIWYG editor);
 *   - `ConfirmDialog` — delete (edit mode only).
 * The page owns the Save/Delete actions + the autosave status hint; no editor
 * logic is re-implemented.
 */
export function AddEditNotePage({ id }: AddEditNotePageProps) {
  const router = useRouter();
  const isEdit = Boolean(id);

  const { data: note, isLoading: loadingNote } = useNote(isEdit ? id : undefined);
  const editor = useNoteEditor(isEdit && note ? note : undefined);
  const deleteMutation = useDeleteNote();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.replace(NOTE_LIST_PATH);
    }
  };

  const handleSave = async () => {
    try {
      await editor.save();
      toast.success(
        isEdit ? "Note updated successfully." : "Note created successfully.",
      );
      router.push(NOTE_LIST_PATH);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save note",
      );
    }
  };

  const handleDelete = () => {
    if (!id) return;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Note deleted.");
        router.replace(NOTE_LIST_PATH);
      },
      onError: () => toast.error("Unable to delete note"),
    });
  };

  return (
    <AuthGate>
      <div className="min-h-dvh bg-background text-foreground">
        <header className="sticky top-[65px] z-30 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
          <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={goBack}
              aria-label="Back"
            >
              <ArrowLeft className="size-5" aria-hidden />
            </Button>
            <h1 className="text-xl font-bold">
              {isEdit ? "Edit Note" : "New Note"}
            </h1>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden text-xs text-muted-foreground sm:inline" aria-live="polite">
                {editor.isSaving
                  ? "Saving…"
                  : editor.hasChanges
                    ? "Unsaved changes"
                    : "Saved"}
              </span>
              {isEdit ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Delete note"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              ) : null}
              <Button size="sm" onClick={handleSave} disabled={editor.isSaving}>
                {editor.isSaving
                  ? "Saving…"
                  : isEdit
                    ? "Update"
                    : "Save"}
              </Button>
            </div>
          </div>
        </header>

        <PageContainer maxWidth="3xl" className="py-6 pb-16">
          {isEdit && loadingNote ? (
            <LoadingState label="Loading note…" />
          ) : editor.draft ? (
            <NoteEditor
              title={editor.draft.title}
              category={editor.draft.category}
              color={editor.draft.color}
              description={editor.draft.description}
              onTitleChange={(title) => editor.update({ title })}
              onCategoryChange={(category) => editor.update({ category })}
              onColorChange={(color) => editor.update({ color })}
              onDescriptionChange={(html) => editor.update({ description: html })}
              onAutoSave={(html) => editor.update({ description: html })}
            />
          ) : null}
        </PageContainer>

        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete note?"
          description={note?.title}
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={handleDelete}
        />
      </div>
    </AuthGate>
  );
}
