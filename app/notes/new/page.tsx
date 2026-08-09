import type { Metadata } from "next";
import { AddEditNoteLazy } from "@/features/notes/components/add-edit-note-lazy";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "New Note",
  path: "/notes/new",
  noindex: true, // private, user-owned notes
});

export default function NewNoteRoute() {
  return <AddEditNoteLazy />;
}
