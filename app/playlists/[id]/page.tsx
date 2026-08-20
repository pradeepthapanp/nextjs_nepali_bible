import type { Metadata } from "next";
import { PlaylistDetailPage } from "@/features/music/components/playlist-detail-page";
import { createMusicServices } from "@/features/music/services";
import { derivePlaylistDescription } from "@/features/music/utils";
import { JsonLd } from "@/components/json-ld";
import {
  breadcrumbListGraph,
  collectionPageGraph,
  type JsonLdGraph,
} from "@/lib/json-ld";
import { createClient } from "@/lib/supabase/server";
import { pageDescriptions, seo } from "@/lib/seo";

/**
 * Resolves a playlist (best effort — playlists are user-scoped, so
 * signed-out callers get nothing).
 */
async function findPlaylist(id: string) {
  const services = createMusicServices(await createClient());
  const playlists = await services.playlist.fetchPlaylists();
  const playlist = playlists.find((entry) => entry.id === id);
  if (!playlist?.name) return null;
  // Real song count (existing `playlist_songs` data) — used by the
  // description derivation so same-named playlists stay distinct.
  const songs = await services.playlistSong.fetchPlaylistSongs(id);
  return { playlist, songCount: songs.length };
}

/** CollectionPage structured data for a playlist (private → best effort). */
async function playlistJsonLd(id: string): Promise<JsonLdGraph[] | null> {
  const path = `/playlists/${id}`;
  try {
    const found = await findPlaylist(id);
    if (found) {
      const { playlist, songCount } = found;
      return [
        collectionPageGraph({
          title: playlist.name,
          // Derived from EXISTING playlist name/description/count — never
          // invented, and unique even across same-named playlists.
          description: derivePlaylistDescription(playlist, songCount),
          path,
        }),
        breadcrumbListGraph([
          { name: "Playlists", path: "/playlists" },
          { name: playlist.name, path },
        ]),
      ];
    }
  } catch {
    // Signed-out / private playlist → no structured data.
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const path = `/playlists/${id}`;
  try {
    const found = await findPlaylist(id);
    if (found) {
      const { playlist, songCount } = found;
      return seo({
        title: playlist.name,
        description: derivePlaylistDescription(playlist, songCount),
        path,
      });
    }
  } catch {
    // Signed-out / private playlist → fall through to a generic title.
  }
  return seo({ title: "Playlist", description: pageDescriptions.playlists, path });
}

/**
 * Playlist detail route (`/playlists/{id}`) — one playlist's songs with
 * play / reorder / remove / favorite actions. The `{id}` segment is read by
 * `PlaylistDetailPage` via `useParams` (the AddEditAudioPage pattern), so
 * this stays a thin server shell.
 */
export default async function PlaylistDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const jsonLd = await playlistJsonLd(id);
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <PlaylistDetailPage />
    </>
  );
}
