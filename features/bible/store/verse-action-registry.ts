"use client";

import { create } from "zustand";
import type { VerseAction } from "../types";

/**
 * VerseActionRegistry — the plugin system for verse actions.
 *
 * Copy, Share and future actions (Highlight, Note, Bookmark, Compare, AI) all
 * register themselves here instead of being hardcoded in the toolbar or menu.
 * The toolbar / context menu render whatever is registered, so a new action is
 * added with one plugin + one `register` call — no component changes.
 *
 * The registry is a tiny Zustand store so registered actions are reactive.
 */

export interface VerseActionRegistryState {
  /** Actions keyed by id. */
  actions: Record<string, VerseAction>;
  register: (action: VerseAction) => void;
  registerMany: (actions: VerseAction[]) => void;
}

export const useVerseActionRegistry = create<VerseActionRegistryState>()(
  (set) => ({
    actions: {},
    register: (action) =>
      set((state) => ({
        actions: { ...state.actions, [action.id]: action },
      })),
    registerMany: (actions) =>
      set((state) => ({
        actions: actions.reduce(
          (acc, action) => ({ ...acc, [action.id]: action }),
          state.actions,
        ),
      })),
  }),
);

/** Convenience for registering without subscribing (module-load safe). */
export function registerVerseAction(action: VerseAction): void {
  useVerseActionRegistry.getState().register(action);
}
