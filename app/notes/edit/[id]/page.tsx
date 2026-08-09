import type { Metadata } from "next";
import { AddEditNoteLazy } from "@/features/notes/components/add-edit-note-lazy";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Edit Note",
  path: "/notes/edit",
  noindex: true, // private, user-owned notes
});

export default async function EditNoteRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AddEditNoteLazy id={id} />;
}
