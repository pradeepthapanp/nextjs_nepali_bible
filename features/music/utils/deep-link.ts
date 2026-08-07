import type { MusicDeepLink } from "../types";
import { isSongCategory } from "./category";

/**
 * Builds and parses deep-link URLs for Music locations — the counterpart to
 * `features/bible/utils/deep-link.ts`. Pure functions reused by the router,
 * share dialogs and the `useMusicDeepLink` hook.
 *
 * Canonical shapes (see `types/deep-link.ts`):
 *   /music
 *   /music?category={category}&q={query}
 *   /music/song/{songId}
 *   /music/category/{category}
 *   /music/search[?q={query}]
 *   /playlists
 *   /playlists/{playlistId}
 *   /music/artists
 *   /music/artist/{artistId}
 *   /music/chords
 */

/** Builds a URL path+query for a Music deep link. */
export function buildMusicUrl(link: MusicDeepLink): string {
  switch (link.kind) {
    case "songs": {
      const params: string[] = [];
      if (link.category && link.category !== "all") {
        params.push(`category=${encodeURIComponent(link.category)}`);
      }
      if (link.query) params.push(`q=${encodeURIComponent(link.query)}`);
      return params.length > 0 ? `/music?${params.join("&")}` : "/music";
    }
    case "song":
      return `/music/song/${encodeURIComponent(link.songId)}`;
    case "category":
      return `/music/category/${encodeURIComponent(link.category)}`;
    case "search":
      return link.query
        ? `/music/search?q=${encodeURIComponent(link.query)}`
        : "/music/search";
    case "chords":
      return "/music/chords";
    case "playlists":
      return "/playlists";
    case "playlist":
      return `/playlists/${encodeURIComponent(link.playlistId)}`;
    case "artists":
      return "/music/artists";
    case "artist":
      return `/music/artist/${encodeURIComponent(link.artistId)}`;
  }
}

/**
 * Parses a URL (path + search) into a deep link, or null when unmatched.
 * The `category` query value is validated against the known categories.
 */
export function parseMusicUrl(
  pathname: string,
  search: string,
): MusicDeepLink | null {
  // Top-level playlist routes (the canonical `/playlists` + `/playlists/{id}`
  // paths emitted by `buildMusicUrl`).
  if (pathname === "/playlists") return { kind: "playlists" };
  if (pathname.startsWith("/playlists/")) {
    const playlistId = decodeURIComponent(pathname.slice("/playlists/".length));
    return playlistId ? { kind: "playlist", playlistId } : null;
  }

  if (!pathname.startsWith("/music")) return null;

  // /music?category={category}&q={query}
  if (pathname === "/music") {
    const params = new URLSearchParams(search);
    const category = params.get("category");
    const query = params.get("q");
    const validCategory = category && isSongCategory(category)
      ? category
      : undefined;
    if (!validCategory && !query) return { kind: "songs" };
    return {
      kind: "songs",
      category: validCategory,
      query: query?.trim() ? query : undefined,
    };
  }

  const segments = pathname.slice("/music".length).split("/").filter(Boolean);
  switch (segments[0]) {
    case "song":
      return segments[1]
        ? { kind: "song", songId: decodeURIComponent(segments[1]) }
        : null;
    case "category": {
      const category = segments[1];
      if (!category || segments.length !== 2 || !isSongCategory(category)) {
        return null;
      }
      return { kind: "category", category };
    }
    case "search": {
      if (segments.length !== 1) return null;
      const params = new URLSearchParams(search);
      const query = params.get("q");
      return {
        kind: "search",
        query: query?.trim() ? query : undefined,
      };
    }
    case "playlists":
      return segments.length === 1 ? { kind: "playlists" } : null;
    case "playlist":
      return segments[1]
        ? { kind: "playlist", playlistId: decodeURIComponent(segments[1]) }
        : null;
    case "artists":
      return segments.length === 1 ? { kind: "artists" } : null;
    case "artist":
      return segments[1]
        ? { kind: "artist", artistId: decodeURIComponent(segments[1]) }
        : null;
    case "chords":
      return segments.length === 1 ? { kind: "chords" } : null;
    default:
      return null;
  }
}

/** The song id carried by a deep link, or undefined. */
export function musicLinkSongId(
  link: MusicDeepLink | null,
): string | undefined {
  return link?.kind === "song" ? link.songId : undefined;
}
