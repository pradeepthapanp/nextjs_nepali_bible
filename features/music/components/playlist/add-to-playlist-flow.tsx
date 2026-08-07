"use client";

import { useMemo } from "react";
import {
  useCreatePlaylist,
  usePlaylistMembership,
  usePlaylists,
  useTogglePlaylistSong,
} from "../../queries";
import { usePlaylistSelectionStore } from "../../store";
import type { Song } from "../../types";
import { PlaylistDialog } from "../dialogs/playlist-dialog";
import { AddToPlaylistDialog } from "./add-to-playlist-dialog";

export interface AddToPlaylistFlowProps {
  /** The song being added to a playlist; null renders nothing. */
  song: Song | null;
  /** Fired when the whole flow is dismissed (the parent clears its song). */
  onClose: () => void;
}

/**
 * AddToPlaylistFlow — the SINGLE add-to-playlist composition shared by every
 * surface (Song Reader, Music list, etc.), so the dialog is byte-identical
 * no matter where it is opened.
 *
 * It renders the `AddToPlaylistDialog` (the sheet) + the create
 * `PlaylistDialog`, driven by `PlaylistSelectionStore` (`sheetOpen` /
 * `dialogMode`) so dialog visibility is shared, not duplicated per page. Data
 * + mutations come from the existing queries:
 *   - `usePlaylists` — the playlists to choose from;
 *   - `usePlaylistMembership` — whether the song is already in each playlist;
 *   - `useTogglePlaylistSong` — the per-playlist membership mutation;
 *   - `useCreatePlaylist` — creating a new playlist from the sheet.
 *
 * Mount this component only when there is a song to act on (the parent sets
 * its song + calls `openSheet` together), and clear it via `onClose`.
 */
export function AddToPlaylistFlow({ song, onClose }: AddToPlaylistFlowProps) {
  const sheetOpen = usePlaylistSelectionStore((state) => state.sheetOpen);
  const closeSheet = usePlaylistSelectionStore((state) => state.closeSheet);
  const dialogMode = usePlaylistSelectionStore((state) => state.dialogMode);
  const openDialog = usePlaylistSelectionStore((state) => state.openDialog);
  const closeDialog = usePlaylistSelectionStore((state) => state.closeDialog);

  const playlists = usePlaylists();
  const togglePlaylistSong = useTogglePlaylistSong();
  const createPlaylist = useCreatePlaylist();

  const playlistList = useMemo(() => playlists.data ?? [], [playlists.data]);
  const playlistIds = useMemo(
    () => playlistList.map((playlist) => playlist.id),
    [playlistList],
  );
  const membership = usePlaylistMembership(playlistIds, song?.id ?? "");

  if (!song) return null;

  return (
    <>
      <AddToPlaylistDialog
        open={sheetOpen}
        onOpenChange={(open) => {
          if (open) return;
          closeSheet();
          onClose();
        }}
        song={song}
        playlists={playlistList}
        isInPlaylist={membership}
        onToggleSong={(playlistId, added) =>
          void togglePlaylistSong.mutate({ playlistId, song, added })
        }
        onCreate={() => openDialog("create")}
      />
      {/* The create form stacks on top of the sheet; closing it returns to
          the sheet with the freshly-created playlist already listed. */}
      <PlaylistDialog
        open={dialogMode !== null}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        mode="create"
        onSubmit={(input) => {
          void createPlaylist.mutateAsync(input).then(() => closeDialog());
        }}
      />
    </>
  );
}
