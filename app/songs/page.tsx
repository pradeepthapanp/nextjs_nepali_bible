import type { Metadata } from "next";
import { AudioListPage } from "@/features/songs/components/audio-list-page";
import { JsonLd } from "@/components/json-ld";
import {
  breadcrumbListGraph,
  collectionPageGraph,
} from "@/lib/json-ld";
import { pageDescriptions, seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Songs",
  description: pageDescriptions.music,
  path: "/songs",
});

/**
 * Online Songs library route — the `AudiosListPage` (web `/audio_songs`).
 * Client component; no Suspense needed (no `useSearchParams`).
 */
export default function SongsPage() {
  return (
    <>
      <JsonLd
        data={[
          collectionPageGraph({
            title: "Songs",
            description: pageDescriptions.music,
            path: "/songs",
          }),
          breadcrumbListGraph([{ name: "Songs", path: "/songs" }]),
        ]}
      />
      <AudioListPage />
    </>
  );
}
