import type { Metadata } from "next";
import { PlaylistsPage } from "@/features/music/components/playlists-page";
import { JsonLd } from "@/components/json-ld";
import {
  breadcrumbListGraph,
  collectionPageGraph,
} from "@/lib/json-ld";
import { pageDescriptions, seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Playlists",
  description: pageDescriptions.playlists,
  path: "/playlists",
});

/**
 * Playlists route (`/playlists`) — the user's playlist collection. Thin
 * server shell; all data + actions live in the client `PlaylistsPage`.
 */
export default function PlaylistsRoute() {
  return (
    <>
      <JsonLd
        data={[
          collectionPageGraph({
            title: "Playlists",
            description: pageDescriptions.playlists,
            path: "/playlists",
          }),
          breadcrumbListGraph([{ name: "Playlists", path: "/playlists" }]),
        ]}
      />
      <PlaylistsPage />
    </>
  );
}
