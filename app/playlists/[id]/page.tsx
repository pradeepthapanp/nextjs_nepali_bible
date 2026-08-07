import { PlaylistDetailPage } from "@/features/music/components/playlist-detail-page";

/**
 * Playlist detail route (`/playlists/{id}`) — one playlist's songs with
 * play / reorder / remove / favorite actions. The `{id}` segment is read by
 * `PlaylistDetailPage` via `useParams` (the AddEditAudioPage pattern), so
 * this stays a thin server shell.
 */
export default function PlaylistDetailRoute() {
  return <PlaylistDetailPage />;
}
