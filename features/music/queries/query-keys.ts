import type { SongCategory } from "../types";

/**
 * Central React Query cache keys for the Music feature. Hierarchical keys let
 * mutations invalidate whole families (e.g. all songs for a category, all
 * playlists) with one call — the single source of cache identity. Mirrors
 * `bibleKeys` in `features/bible/queries/query-keys.ts`.
 */
export const musicKeys = {
  all: ["music"] as const,

  songs: () => [...musicKeys.all, "songs"] as const,
  songsByCategory: (category: SongCategory) =>
    [...musicKeys.songs(), "category", category] as const,
  songsInfinite: (category: SongCategory) =>
    [...musicKeys.songs(), "infinite", category] as const,
  songsByArtist: (artistId: string) =>
    [...musicKeys.songs(), "artist", artistId] as const,
  song: (id: string) => [...musicKeys.all, "song", id] as const,

  songSearch: (query: string, category: SongCategory) =>
    [...musicKeys.all, "search", query, category] as const,
  songSearchInfinite: (query: string, category: SongCategory) =>
    [...musicKeys.all, "search", "infinite", query, category] as const,

  artists: () => [...musicKeys.all, "artists"] as const,
  artist: (id: string) => [...musicKeys.all, "artist", id] as const,

  playlists: {
    all: () => [...musicKeys.all, "playlists"] as const,
    favorites: () => [...musicKeys.all, "playlists", "favorites"] as const,
    playlist: (id: string) => [...musicKeys.all, "playlists", id] as const,
    songs: (playlistId: string) =>
      [...musicKeys.all, "playlists", playlistId, "songs"] as const,
  },
} as const;
