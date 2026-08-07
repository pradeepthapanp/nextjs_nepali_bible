"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { Playlist } from "@features/music/types";

export interface DeletePlaylistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playlist: Playlist | null;
  /** Confirm deletion (the parent composes `usePlaylistActions`). */
  onConfirm?: () => void;
  loading?: boolean;
}

/**
 * DeletePlaylistDialog — the destructive "delete playlist?" confirmation
 * (the web equivalent of the delete dialogs in `playlist_view.dart` /
 * `playlist_song_page.dart`). Reuses the shared `ConfirmDialog` primitive —
 * no dialog logic is duplicated.
 */
export function DeletePlaylistDialog({
  open,
  onOpenChange,
  playlist,
  onConfirm,
  loading,
}: DeletePlaylistDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete playlist?"
      description={
        playlist
          ? `"${playlist.name}" and its songs will be removed.`
          : undefined
      }
      confirmLabel="Delete"
      variant="destructive"
      loading={loading}
      onConfirm={onConfirm}
    />
  );
}
