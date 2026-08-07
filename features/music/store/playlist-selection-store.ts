"use client";

import { create } from "zustand";

/**
 * Playlist selection store — transient UI state for the playlist flows:
 *   - `selectedPlaylistId` — the playlist currently selected / being acted
 *     on (e.g. in the "Add to Playlist" sheet, or a list row being edited).
 *   - `sheetOpen` — whether the "Add to Playlist" bottom sheet is open
 *     (Flutter's `AddToPlaylistSheet`).
 *   - `dialogMode` — whether the create/edit playlist dialog is open and in
 *     which mode (`"create"` | `"edit"` | `null`) — Flutter's
 *     `CreatePlaylistDialog` is reused for both create and edit.
 *
 * UI state only — the playlists themselves are server state (React Query via
 * `musicKeys.playlists`), never duplicated here. NOT persisted (dialog/sheet
 * visibility and the transient selection must not survive restarts).
 */

export type PlaylistDialogMode = "create" | "edit";

export interface PlaylistSelectionStore {
  selectedPlaylistId: string | null;
  sheetOpen: boolean;
  dialogMode: PlaylistDialogMode | null;
  select: (playlistId: string | null) => void;
  openSheet: () => void;
  closeSheet: () => void;
  openDialog: (mode: PlaylistDialogMode) => void;
  closeDialog: () => void;
}

/** Playlist flow UI state (selected playlist + dialog/sheet visibility). */
export const usePlaylistSelectionStore = create<PlaylistSelectionStore>()(
  (set) => ({
    selectedPlaylistId: null,
    sheetOpen: false,
    dialogMode: null,
    select: (selectedPlaylistId) => set({ selectedPlaylistId }),
    openSheet: () => set({ sheetOpen: true }),
    closeSheet: () => set({ sheetOpen: false }),
    openDialog: (dialogMode) => set({ dialogMode }),
    closeDialog: () => set({ dialogMode: null }),
  }),
);
