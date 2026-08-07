"use client";

import { create } from "zustand";
import type { SongCategory } from "../types";

/**
 * Song category filter store — the Zustand replacement for
 * `SongCategoryNotifier` (`lib/providers/music/song_category_provider.dart`).
 * Holds the currently selected filter chip; `all` is the default.
 *
 * This is client UI state only (the songs themselves are server state owned
 * by React Query via `musicKeys.songsByCategory`). NOT persisted — Flutter's
 * notifier is in-memory and resets to `all` on restart.
 */
export interface SongCategoryStore {
  category: SongCategory;
  setCategory: (category: SongCategory) => void;
}

/** Selected category filter chip (UI state only). */
export const useSongCategoryStore = create<SongCategoryStore>()((set) => ({
  category: "all",
  setCategory: (category) => set({ category }),
}));
