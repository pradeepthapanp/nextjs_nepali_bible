"use client";

import { create } from "zustand";
import type { SongReaderSource } from "../types";

/**
 * Song Reader store — the web equivalent of `MusicLandedArgs` MINUS the song
 * list. It holds only UI state:
 *   - `source` — WHERE the reader was opened from (single-song deep link,
 *     category list, playlist, or artist). The actual song list is resolved
 *     from the React Query cache for that source (`useSong` / `useSongs` /
 *     `usePlaylistSongs` / `useArtistSongs`) — it is NEVER duplicated here,
 *     so server data stays entirely inside React Query.
 *   - `songPosition` — the current page in the reader swiper
 *     (`MusicLanded._currentIndex`), so the swiper can move prev/next without
 *     re-navigation.
 *
 * NOT persisted — the reader context is transient and rebuilt on navigation.
 */
export interface SongReaderStore {
  source: SongReaderSource | null;
  songPosition: number;
  open: (source: SongReaderSource, songPosition: number) => void;
  setSongPosition: (songPosition: number) => void;
  clear: () => void;
}

/** Current reader context + page (UI state only; the list lives in React Query). */
export const useSongReaderStore = create<SongReaderStore>()((set) => ({
  source: null,
  songPosition: 0,
  open: (source, songPosition) => set({ source, songPosition }),
  setSongPosition: (songPosition) => set({ songPosition }),
  clear: () => set({ source: null, songPosition: 0 }),
}));
