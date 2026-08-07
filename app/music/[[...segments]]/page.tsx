import { Suspense } from "react";
import { MusicRouteDispatcher } from "@/features/music/components/music-route-dispatcher";

/**
 * Music route — the mount point for the song list and the song reader.
 *
 * A single catch-all route covers every deep-link shape handled by
 * `parseMusicUrl` (`/music`, `/music/song/{id}`, `/music/category/{category}`,
 * `/music/search`, `/music/artist/{id}`, playlists/artists/chords).
 * `MusicRouteDispatcher` routes `/music/song/{id}` to the Song Reader and
 * everything else to `MusicHome`; both read the path/search params themselves,
 * so this page stays a thin server shell.
 * `Suspense` is required because the children use `useSearchParams`
 * (via `useMusicDeepLink`) and this page is prerendered.
 */
export default function MusicPage() {
  return (
    <Suspense fallback={null}>
      <MusicRouteDispatcher />
    </Suspense>
  );
}
