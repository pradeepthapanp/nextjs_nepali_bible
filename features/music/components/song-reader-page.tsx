"use client";

import { useMemo, useState } from "react";
import { ListPlus } from "lucide-react";
import { useAuth } from "@features/auth";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import {
  RelatedLinks,
  type RelatedLinkItem,
} from "@/components/related/related-links";
import {
  useFavoriteSongs,
  useLyrics,
  useSongNavigation,
  useSongReader,
  useSongSettings,
} from "../hooks";
import { useArtist, useSong } from "../queries";
import { usePlaylistSelectionStore } from "../store";
import type { Song } from "../types";
import {
  buildMusicUrl,
  categoryLabel,
  deriveSongDescription,
  readerTitle,
} from "../utils";
import { ChordDialog } from "../chords";
import { AddToPlaylistFlow } from "./playlist/add-to-playlist-flow";
import { FavoriteButton } from "./song/favorite-button";
import { ReaderNavigation } from "./reader/reader-navigation";
import { SongReader } from "./reader/song-reader";
import { SongToolbar } from "./reader/song-toolbar";

/**
 * SongReaderPage — the page-level orchestration for the Song Reader (the web
 * equivalent of `music_landed.dart`). The URL is the deep-linked song; the
 * reader context (source + position) and the parsed render tree come entirely
 * from existing hooks:
 *   - `useSongNavigation` — prev/next + deep-link URL push + URL→reader sync;
 *   - `useSongReader` — the current song resolved from the source's list;
 *   - `useLyrics` — the already-parsed `LyricsRenderTree` (never parsed here);
 *   - `useSongSettings` — reader font size (applied to the lyric surface);
 *   - `useFavoriteSongs` — the favorite toggle;
 *   - `usePlaylists` + `usePlaylistMembership` + `useTogglePlaylistSong` +
 *     `useCreatePlaylist` — the add-to-playlist flow.
 *
 * The page only composes; it never parses lyrics, transposes, queries
 * Supabase directly or owns business logic. Transpose/font/language/chords
 * controls all live in the reusable `SongToolbar`.
 */
export function SongReaderPage() {
  const navigation = useSongNavigation();
  const reader = useSongReader();
  const settings = useSongSettings();
  const favorites = useFavoriteSongs();
  const { isAuthenticated } = useAuth();

  const song = reader.currentSong;
  const { tree, showChords } = useLyrics(song);
  const { data: artist } = useArtist(song?.artistId ?? undefined);

  // Related links — driven by the song's EXISTING metadata (no invented
  // relationships): the `artist_id` FK → the artist detail page, and the
  // concrete `category` → the category-filtered song list. `others` is the
  // artist-linked sentinel (its "category" link would duplicate the artist
  // link), so it is skipped there.
  const artistLinks = useMemo<RelatedLinkItem[]>(() => {
    if (!song?.artistId || !artist?.name) return [];
    return [
      {
        href: buildMusicUrl({ kind: "artist", artistId: song.artistId }),
        label: artist.name,
      },
    ];
  }, [song, artist]);

  const categoryLinks = useMemo<RelatedLinkItem[]>(() => {
    if (!song?.category || song.category === "others") return [];
    return [
      {
        href: buildMusicUrl({ kind: "category", category: song.category }),
        label: categoryLabel(song.category),
      },
    ];
  }, [song]);

  // Shared add-to-playlist flow — the same dialog as the Music list.
  const [addToPlaylistSong, setAddToPlaylistSong] = useState<Song | null>(null);
  const openAddToPlaylist = usePlaylistSelectionStore(
    (state) => state.openSheet,
  );

  // Tappable chords — tapping any rendered chord opens the chord dialog with
  // that (already-transposed) chord. State lives here so the dialog closes on
  // navigation and the chord is restored across re-renders.
  const [chordDialog, setChordDialog] = useState<{ chord: string } | null>(null);

  // Loading/error for a DIRECT deep-link landing (`/music/song/{id}` with no
  // reader source). When the reader was opened from a list, the source query
  // already resolves the song, so this query stays disabled (no extra fetch).
  const linkSongId =
    navigation.currentLink?.kind === "song"
      ? navigation.currentLink.songId
      : undefined;
  const songQuery = useSong(linkSongId ?? "", Boolean(linkSongId) && !reader.source);

  const isFavorite = song ? favorites.isFavorite(song.id) : false;
  const title = song ? readerTitle(song, artist?.name) : "Song";
  let body: React.ReactNode;
  if (song && tree) {
    body = (
      <SongReader
        tree={tree}
        showChords={showChords}
        onChordTap={(chord) => setChordDialog({ chord })}
      />
    );
  } else if (songQuery.isError) {
    body = (
      <ErrorState
        title="गीत भेटिएन"
        description="यो गीत लोड गर्न सकिएन। फेरि प्रयास गर्नुहोस्।"
        onRetry={() => void songQuery.refetch()}
      />
    );
  } else if (!linkSongId) {
    body = (
      <EmptyState
        icon={ListPlus}
        title="गीत चयन गरिएको छैन"
        description="सूचीबाट एउटा गीत खोल्नुहोस्।"
      />
    );
  } else {
    body = <LoadingState label="गीत लोड हुँदैछ…" />;
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-[65px] z-30 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto w-full max-w-6xl space-y-2 px-4 pb-3 pt-3">
          <div className="flex items-center justify-between gap-3">
            <h1 className="truncate text-xl font-bold">{title}</h1>
            {song && isAuthenticated ? (
              <div className="flex shrink-0 items-center gap-1">
                <FavoriteButton
                  isFavorite={isFavorite}
                  onToggle={() => void favorites.toggleSong(song)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Add to playlist"
                  onClick={() => {
                    setAddToPlaylistSong(song);
                    openAddToPlaylist();
                  }}
                >
                  <ListPlus className="size-4" aria-hidden />
                </Button>
              </div>
            ) : null}
          </div>
          {song ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {deriveSongDescription(song)}
            </p>
          ) : null}
          <SongToolbar />
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <main
          className="min-w-0"
          style={{ fontSize: settings.fontSize }}
        >
          {body}
        </main>
        <ReaderNavigation
          onPrev={navigation.previous}
          onNext={navigation.next}
          canPrev={reader.songPosition > 0}
          canNext={reader.songPosition < reader.songs.length - 1}
          className="mt-6"
        />
        <RelatedLinks title="Related artist" links={artistLinks} className="mt-8" />
        <RelatedLinks title="Related category" links={categoryLinks} className="mt-8" />
      </div>

      <AddToPlaylistFlow
        song={addToPlaylistSong}
        onClose={() => setAddToPlaylistSong(null)}
      />

      <ChordDialog
        open={Boolean(chordDialog)}
        onOpenChange={(open) => {
          if (!open) setChordDialog(null);
        }}
        chord={chordDialog?.chord ?? null}
      />
    </div>
  );
}
