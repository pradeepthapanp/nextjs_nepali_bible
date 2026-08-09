"use client";

import dynamic from "next/dynamic";

/**
 * Client-only lazy wrapper for the Add/Edit note page. Quill touches
 * `document` at MODULE LOAD, so the editor page must never enter the server
 * bundle — this wrapper (used by the `/notes/new` + `/notes/edit/[id]` route
 * shells) loads `AddEditNotePage` with `ssr: false`.
 */
const AddEditNotePage = dynamic(
  () =>
    import("./add-edit-note-page").then((module) => module.AddEditNotePage),
  { ssr: false },
);

export interface AddEditNoteLazyProps {
  /** Present in edit mode (the route `/notes/edit/{id}`). */
  id?: string;
}

export function AddEditNoteLazy({ id }: AddEditNoteLazyProps) {
  return <AddEditNotePage id={id} />;
}
