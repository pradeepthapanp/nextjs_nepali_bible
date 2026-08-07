import { PlaylistsPage } from "@/features/music/components/playlists-page";

/**
 * Playlists route (`/playlists`) — the user's playlist collection. Thin
 * server shell; all data + actions live in the client `PlaylistsPage`.
 */
export default function PlaylistsRoute() {
  return <PlaylistsPage />;
}
