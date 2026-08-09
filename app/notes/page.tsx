import type { Metadata } from "next";
import { NotesPage } from "@/features/notes/components/notes-page";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Notes",
  path: "/notes",
  noindex: true, // private, user-owned notes
});

export default function NotesRoute() {
  return <NotesPage />;
}
