"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { AuthGate } from "@features/auth";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageContainer } from "@/components/ui/page-container";
import { NOTE_EDIT_PATH_PREFIX, NOTE_NEW_PATH } from "../constants";
import { useNoteLibrary } from "../hooks";
import type { Note } from "../types";
import { NoteCategoryFilter } from "./note-category-filter";
import { NoteList } from "./note-list";
import { NoteSearchBar } from "./note-search-bar";
import { NoteSortMenu } from "./note-sort-menu";

/**
 * NotesPage — the user's notes list (the web equivalent of the Flutter
 * `NotesPage`). Compose-only: `useNoteLibrary` (list + client-side
 * search/category/sort + delete) drives the search bar, category chips, sort
 * select and the note grid. `AuthGate`-protected (notes are user-owned).
 */
export function NotesPage() {
  const router = useRouter();
  const library = useNoteLibrary();
  const [pendingDelete, setPendingDelete] = useState<Note | null>(null);

  return (
    <AuthGate>
      <div className="min-h-dvh bg-background text-foreground">
        <header className="sticky top-[65px] z-30 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
          <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3">
            <h1 className="text-xl font-bold">Notes</h1>
            <div className="ml-auto flex items-center gap-2">
              <NoteSortMenu value={library.sort} onChange={library.setSort} />
              <Button size="sm" onClick={() => router.push(NOTE_NEW_PATH)}>
                <Plus className="size-4" aria-hidden />
                New Note
              </Button>
            </div>
          </div>
        </header>

        <PageContainer maxWidth="6xl" className="space-y-3 py-4 pb-16">
          <NoteSearchBar value={library.search} onChange={library.setSearch} />
          {library.categories.length > 0 ? (
            <NoteCategoryFilter
              categories={library.categories}
              value={library.category}
              onChange={library.setCategory}
            />
          ) : null}
          <NoteList
            notes={library.filtered}
            isLoading={library.isLoading}
            isError={library.isError}
            onRetry={() => void library.refetch()}
            onOpen={(note) => router.push(`${NOTE_EDIT_PATH_PREFIX}/${note.id}`)}
            onDelete={(note) => setPendingDelete(note)}
          />
        </PageContainer>

        <ConfirmDialog
          open={pendingDelete !== null}
          onOpenChange={(open) => {
            if (!open) setPendingDelete(null);
          }}
          title="Delete note?"
          description={pendingDelete?.title}
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={() => {
            if (pendingDelete) library.deleteNote(pendingDelete.id);
            setPendingDelete(null);
          }}
        />
      </div>
    </AuthGate>
  );
}
