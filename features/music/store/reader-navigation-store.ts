"use client";

import { create } from "zustand";
import type { MusicDeepLink } from "../types";

/**
 * Reader/navigation deep-link context — transient UI state.
 *
 * Holds a PENDING deep-link target (`MusicDeepLink`) that the Music section
 * should apply once it mounts (e.g. a `/music/song/{id}` or
 * `/music/playlist/{id}` link landed on before the reader/list is ready).
 * `consumePendingTarget` is a one-shot read that clears it, so the target is
 * applied exactly once. The actual data for the target (song, playlist,
 * artist) is resolved from React Query — never stored here.
 *
 * UI state only — NOT persisted (a pending navigation must not survive a
 * restart).
 */
export interface ReaderNavigationStore {
  pendingTarget: MusicDeepLink | null;
  setPendingTarget: (target: MusicDeepLink | null) => void;
  /** Reads and clears the pending target (applied exactly once). */
  consumePendingTarget: () => MusicDeepLink | null;
}

/** Pending deep-link navigation context (UI state only). */
export const useReaderNavigationStore = create<ReaderNavigationStore>()(
  (set, get) => ({
    pendingTarget: null,
    setPendingTarget: (pendingTarget) => set({ pendingTarget }),
    consumePendingTarget: () => {
      const target = get().pendingTarget;
      if (target) set({ pendingTarget: null });
      return target;
    },
  }),
);
