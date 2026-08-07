"use client";

import { create } from "zustand";
import type { CommunityDeepLink } from "../types";

interface CommunityNavigationState {
  /**
   * A deep link set BEFORE the community section mounted (e.g. from an
   * external entry point); consumed ONCE by the route dispatcher (later
   * phase) and turned into a real navigation.
   */
  pendingTarget: CommunityDeepLink | null;
  setPendingTarget: (target: CommunityDeepLink | null) => void;
  /** One-shot read: returns the target and clears it. */
  consumePendingTarget: () => CommunityDeepLink | null;
}

/**
 * useCommunityNavigationStore — the pending deep-link target (NON-persisted,
 * one-shot). Mirrors `useArticleNavigationStore` / Music
 * `useReaderNavigationStore`: this is the sanctioned "pending navigation" UI
 * store. NO server state, no session, no profile.
 */
export const useCommunityNavigationStore = create<CommunityNavigationState>(
  (set, get) => ({
    pendingTarget: null,
    setPendingTarget: (target) => set({ pendingTarget: target }),
    consumePendingTarget: () => {
      const target = get().pendingTarget;
      if (target) set({ pendingTarget: null });
      return target;
    },
  }),
);
