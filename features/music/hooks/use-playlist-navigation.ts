"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { MusicDeepLink } from "../types";
import { buildMusicUrl, parseMusicUrl } from "../utils";

/**
 * usePlaylistNavigation — the playlist navigation entry point for the
 * top-level `/playlists` + `/playlists/{playlistId}` routes.
 *
 * Reuses the SAME pure deep-link helpers as `useMusicDeepLink`
 * (`buildMusicUrl` / `parseMusicUrl` — the single URL source), so playlist
 * URLs are built/parsed in exactly one place:
 * - `openPlaylists` / `openPlaylist(id)` — push the deep link (browser
 *   history + refresh-safe location);
 * - `openSong(songId)` — push the song's deep link (`/music/song/{id}`) so
 *   the existing SongReader mounts;
 * - `goBack` — return to the playlist list (browser Back when history allows,
 *   else replace to `/playlists`).
 */
export function usePlaylistNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const currentLink = useMemo<MusicDeepLink | null>(() => {
    if (!pathname.startsWith("/playlists")) return null;
    return parseMusicUrl(pathname, "");
  }, [pathname]);

  const openPlaylists = useCallback(() => {
    router.push(buildMusicUrl({ kind: "playlists" }));
  }, [router]);

  const openPlaylist = useCallback(
    (playlistId: string) => {
      router.push(buildMusicUrl({ kind: "playlist", playlistId }));
    },
    [router],
  );

  const openSong = useCallback(
    (songId: string) => router.push(buildMusicUrl({ kind: "song", songId })),
    [router],
  );

  const goBack = useCallback(() => {
    if (window.history.length > 1) router.back();
    else router.replace("/playlists");
  }, [router]);

  return { currentLink, openPlaylists, openPlaylist, openSong, goBack };
}
