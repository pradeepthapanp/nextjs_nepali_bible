"use client";

import { useMusicDeepLink } from "../hooks";
import { MusicHome } from "./music-home";
import { SongReaderPage } from "./song-reader-page";

/**
 * MusicRouteDispatcher — route-level dispatch for the `/music` catch-all
 * (the counterpart to the Bible module's `BibleRouteDispatcher`).
 *
 * Supported deep-link shapes (parsed by `parseMusicUrl`):
 *   /music, /music?category=&q=            → MusicHome
 *   /music/song/{id}                        → SongReaderPage
 *   /music/category/{category}              → MusicHome (category filter)
 *   /music/search[?q=]                      → MusicHome (search filter)
 *   /music/artist/{id}                      → MusicHome (artist filter)
 *   /music/playlists|playlist|artists|chords → MusicHome (later phases)
 *
 * Only the song reader is a distinct page; every other shape renders the song
 * list with the relevant filter applied (the dedicated artist/search/
 * playlist pages are later phases). Both children read their own deep links,
 * so this component only picks which one to mount.
 */
export function MusicRouteDispatcher() {
  const { currentLink } = useMusicDeepLink();
  const isSong = currentLink?.kind === "song";
  return isSong ? <SongReaderPage /> : <MusicHome />;
}
