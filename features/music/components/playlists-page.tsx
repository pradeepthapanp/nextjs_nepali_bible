"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuth } from "@features/auth";
import { usePlaylistActions, usePlaylistNavigation } from "../hooks";
import { usePlaylistSongCounts, usePlaylists } from "../queries";
import { useSongReaderStore } from "../store";
import type { Playlist } from "../types";
import { DeletePlaylistDialog } from "./dialogs/delete-playlist-dialog";
import { PlaylistDialog } from "./dialogs/playlist-dialog";
import { PlaylistList } from "./playlist/playlist-list";

/**
 * PlaylistsPage — the `/playlists` route (the web equivalent of
 * `playlist_view.dart`). Lists every playlist (system "Favorites" first) with
 * its song count and last-updated time, and the create / rename / clear /
 * delete actions.
 *
 * Compose-only — reuses the existing hooks/components and never duplicates
 * logic:
 *   - `usePlaylists` + `usePlaylistSongCounts` — the playlists + song counts;
 *   - `usePlaylistActions` — create / update / remove / clear mutations;
 *   - `usePlaylistNavigation` — open a playlist (preserves browser history);
 *   - `PlaylistList` / `PlaylistCard` / `PlaylistDialog` /
 *     `DeletePlaylistDialog` — the shared list + dialogs (Favorites is
 *     system-owned, so it cannot be renamed / cleared / deleted — the card
 *     only offers those actions on non-system playlists).
 *
 * Empty states: signed-out users see a "Sign in to view playlists" prompt
 * (playlists are user-scoped), while signed-in users with no playlists get a
 * "Create Playlist" action.
 */
export function PlaylistsPage() {
  const { isLoaded, isAuthenticated } = useAuth();
  const playlistsQuery = usePlaylists();
  const navigation = usePlaylistNavigation();
  const actions = usePlaylistActions();

  const playlistList = useMemo(
    () => playlistsQuery.data ?? [],
    [playlistsQuery.data],
  );
  const playlistIds = useMemo(
    () => playlistList.map((playlist) => playlist.id),
    [playlistList],
  );
  const songCounts = usePlaylistSongCounts(playlistIds);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Playlist | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Playlist | null>(null);
  const [clearTarget, setClearTarget] = useState<Playlist | null>(null);
  const [pending, setPending] = useState(false);

  // A list surface — reset a lingering Song Reader context.
  useEffect(() => {
    useSongReaderStore.getState().clear();
  }, []);

  const run = useCallback(
    async (task: () => Promise<unknown>, onDone: () => void) => {
      setPending(true);
      try {
        await task();
      } finally {
        setPending(false);
        onDone();
      }
    },
    [],
  );

  let body: React.ReactNode;
  if (playlistsQuery.isLoading) {
    body = <LoadingState label="Playlists loading…" />;
  } else if (playlistsQuery.isError) {
    body = (
      <ErrorState
        title="Playlists could not be loaded"
        description="Please try again in a moment."
        error={playlistsQuery.error ?? undefined}
        onRetry={() => void playlistsQuery.refetch()}
      />
    );
  } else {
    // Playlists are user-scoped — signed-out visitors get a sign-in prompt
    // instead of the create action.
    const signedOut = isLoaded && !isAuthenticated;
    body = (
      <PlaylistList
        playlists={playlistList}
        songCounts={songCounts}
        onOpen={(playlist) => navigation.openPlaylist(playlist.id)}
        onEdit={(playlist) => setEditTarget(playlist)}
        onDelete={(playlist) => setDeleteTarget(playlist)}
        onClear={(playlist) => setClearTarget(playlist)}
        emptyTitle={
          signedOut ? "Sign in to view playlists" : "No playlists yet"
        }
        emptyDescription={
          signedOut
            ? "Sign in to see and manage your song playlists."
            : "Create your first playlist to get started."
        }
        emptyAction={
          signedOut ? (
            <Button href={"/sign-in?next=" + encodeURIComponent("/playlists")}>
              Sign In
            </Button>
          ) : (
            <Button type="button" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" aria-hidden />
              Create Playlist
            </Button>
          )
        }
      />
    );
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto w-full max-w-6xl space-y-2 px-4 pb-3 pt-3">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl font-bold">Playlists</h1>
            {playlistList.length > 0 ? (
              <Button
                type="button"
                size="sm"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="size-4" aria-hidden />
                New Playlist
              </Button>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            Your saved song collections — {playlistList.length}{" "}
            {playlistList.length === 1 ? "playlist" : "playlists"}.
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 py-6">{body}</div>

      <PlaylistDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        loading={pending}
        onSubmit={(input) =>
          void run(() => actions.create(input), () => setCreateOpen(false))
        }
      />
      <PlaylistDialog
        open={Boolean(editTarget)}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        mode="edit"
        initialName={editTarget?.name}
        initialDescription={editTarget?.description}
        loading={pending}
        onSubmit={(input) => {
          const target = editTarget;
          if (!target) return;
          void run(
            () =>
              actions.update({
                ...target,
                name: input.name,
                description: input.description,
              }),
            () => setEditTarget(null),
          );
        }}
      />
      <DeletePlaylistDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        playlist={deleteTarget}
        loading={pending}
        onConfirm={() => {
          const target = deleteTarget;
          if (!target) return;
          void run(() => actions.remove(target.id), () => setDeleteTarget(null));
        }}
      />
      <ConfirmDialog
        open={Boolean(clearTarget)}
        onOpenChange={(open) => {
          if (!open) setClearTarget(null);
        }}
        title="Clear playlist?"
        description={
          clearTarget
            ? `Remove all songs from "${clearTarget.name}"?`
            : undefined
        }
        confirmLabel="Clear"
        variant="destructive"
        loading={pending}
        onConfirm={() => {
          const target = clearTarget;
          if (!target) return;
          void run(() => actions.clear(target.id), () => setClearTarget(null));
        }}
      />
    </div>
  );
}
