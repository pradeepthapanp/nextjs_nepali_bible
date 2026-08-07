"use client";

import { create } from "zustand";

/**
 * Song search store — the client-only half of the Flutter `MusicState`
 * (`lib/models/music_state.dart`). The songs array + `hasMore` live in the
 * React Query cache (server state); the UI flags `query` and `isSearching`
 * live here so the list UI knows it is in search mode without fetching extra
 * data. NOT persisted — a refresh restarts search (Flutter's search state is
 * in-memory).
 */
export interface SongSearchStore {
  query: string;
  isSearching: boolean;
  setQuery: (query: string) => void;
  clear: () => void;
}

/** Search input flags (UI state only; results live in React Query). */
export const useSongSearchStore = create<SongSearchStore>()((set) => ({
  query: "",
  isSearching: false,
  setQuery: (query) => set({ query, isSearching: query.trim().length > 0 }),
  clear: () => set({ query: "", isSearching: false }),
}));
