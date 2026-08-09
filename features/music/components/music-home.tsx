"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MicVocal, Music2, X } from "lucide-react";
import { useAuth } from "@features/auth";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { SONG_CATEGORIES } from "../constants";
import {
  useArtistFilter,
  useCategoryFilter,
  useFavoriteSongs,
  useMusicDeepLink,
  useSongSearch,
} from "../hooks";
import { useArtist, useArtistSongs } from "../queries";
import { usePlaylistSelectionStore, useSongReaderStore } from "../store";
import type { Song, SongCategory, SongReaderSource } from "../types";
import { AddToPlaylistFlow } from "./playlist/add-to-playlist-flow";
import { ArtistSelector } from "./artist/artist-selector";
import { CategorySelector } from "./category/category-selector";
import { SearchBar } from "./search/search-bar";
import { SearchResults } from "./search/search-results";
import { SongListItem } from "./song/song-list-item";

/**
 * MusicHome — the page-level orchestration for the song list (the web
 * equivalent of `music_display.dart`).
 *
 * Deliberately thin — it composes the existing behavior hooks and reusable
 * components; it never parses lyrics, transposes, queries Supabase or owns
 * business logic:
 *   - `useCategoryFilter` — category chips + the infinite song list;
 *   - `useSongSearch` — the search field + debounced results;
 *   - `useArtistFilter` + `useArtist`/`useArtistSongs` — the artist filter;
 *   - `useFavoriteSongs` — per-row favorite hearts;
 *   - `useMusicDeepLink` — URL ↔ state (category / search / artist deep
 *     links are applied to the stores; user actions navigate back to the URL).
 *
 * Deep links handled here: `/music`, `/music?category=&q=`,
 * `/music/category/{category}`, `/music/search[?q=]`, `/music/artist/{id}`
 * (the last four all render the list with the filter applied — the dedicated
 * artist/search/playlist pages are later phases).
 */
export function MusicHome() {
  // Signed-out users can browse the catalog, but the favorites / add-to-playlist
  // actions stay disabled until they sign in.
  const { isAuthenticated } = useAuth();
  const actionsDisabled = !isAuthenticated;

  // Deep link — the URL is the source of truth for filters on /music routes.
  const { currentLink, navigate } = useMusicDeepLink();
  const { category, setCategory, songs: categorySongs } = useCategoryFilter();
  const {
    query: searchQuery,
    debouncedQuery,
    isSearching,
    results: searchResults,
    setQuery,
    submit,
    clear,
  } = useSongSearch();
  const { filtered: artists } = useArtistFilter();
  const favorites = useFavoriteSongs();
  const openReader = useSongReaderStore((state) => state.open);
  const clearReader = useSongReaderStore((state) => state.clear);

  // Artist filter — derived from the URL (no local state needed; selecting an
  // artist navigates to `/music/artist/{id}`, clearing returns to `/music`).
  const selectedArtistId =
    currentLink?.kind === "artist" ? currentLink.artistId : null;
  const { data: selectedArtist } = useArtist(selectedArtistId ?? undefined);
  const artistSongsQuery = useArtistSongs(
    selectedArtistId ?? "",
    Boolean(selectedArtistId),
  );

  const [artistPanelOpen, setArtistPanelOpen] = useState(false);

  // Shared add-to-playlist flow — `PlaylistSelectionStore` owns the dialog
  // visibility so the same `AddToPlaylistDialog` opens from every row.
  const [addToPlaylistSong, setAddToPlaylistSong] = useState<Song | null>(null);
  const openAddToPlaylist = usePlaylistSelectionStore(
    (state) => state.openSheet,
  );

  const handleAddToPlaylist = useCallback(
    (song: Song) => {
      setAddToPlaylistSong(song);
      openAddToPlaylist();
    },
    [openAddToPlaylist],
  );

  // URL → store sync (category + search). Runs on every /music route change;
  // the store is what `useCategoryFilter`/`useSongSearch` read, so deep links
  // and chip clicks stay consistent. Only zustand actions are called here —
  // no React setState in the effect.
  useEffect(() => {
    const link = currentLink;
    if (!link) return;
    switch (link.kind) {
      case "songs":
        setCategory(link.category ?? "all");
        if (link.query !== undefined) setQuery(link.query);
        else clear();
        break;
      case "category":
        setCategory(link.category);
        break;
      case "search":
        setQuery(link.query ?? "");
        break;
      default:
        break;
    }
    // A list surface is active — the Song Reader context must be reset.
    clearReader();
  }, [currentLink, setCategory, setQuery, clear, clearReader]);

  const handleCategory = useCallback(
    (next: SongCategory) => {
      setCategory(next);
      navigate(
        next === "all" ? { kind: "songs" } : { kind: "songs", category: next },
      );
    },
    [setCategory, navigate],
  );

  const handleSearchSubmit = useCallback(
    (value: string) => {
      submit(value);
      const trimmed = value.trim();
      navigate(trimmed ? { kind: "songs", query: trimmed } : { kind: "songs" });
    },
    [submit, navigate],
  );

  const handleSearchClear = useCallback(() => {
    clear();
    navigate({ kind: "songs" });
  }, [clear, navigate]);

  const handleArtistSelect = useCallback(
    (artistId: string) => {
      navigate({ kind: "artist", artistId });
      setArtistPanelOpen(false);
    },
    [navigate],
  );

  const clearArtistFilter = useCallback(() => {
    navigate({ kind: "songs" });
    setArtistPanelOpen(false);
  }, [navigate]);

  // Open a song from a list: set the reader source (so prev/next walks this
  // list) + push the song's deep link. Composes the reader store + deep link
  // hook — no duplicated navigation.
  const openSongList = useCallback(
    (source: SongReaderSource, songs: Song[], position: number) => {
      openReader(source, position);
      const target = songs[position];
      if (target) navigate({ kind: "song", songId: target.id });
    },
    [openReader, navigate],
  );

  const categorySongList = useMemo(
    () => categorySongs.data?.pages.flatMap((page) => page) ?? [],
    [categorySongs.data],
  );

  const favoriteProps = useMemo(
    () => ({
      isFavorite: (songId: string) => favorites.isFavorite(songId),
      onToggleFavorite: (song: Song) => void favorites.toggleSong(song),
    }),
    [favorites],
  );

  let body: React.ReactNode;

  if (isSearching) {
    // While a query is armed but the debounced results haven't resolved yet
    // (no data), show the loading surface instead of a false "no songs".
    const searchLoading = isSearching && !searchResults.data;
    body = (
      <SearchResults
        songs={searchResults.data ?? []}
        loading={searchLoading}
        error={searchResults.isError ? (searchResults.error as Error) : null}
        onRetry={() => void searchResults.refetch()}
        itemProps={(song) => ({
          onOpen: () => {
            const list = searchResults.data ?? [];
            const index = list.findIndex((entry) => entry.id === song.id);
            openSongList(
              { type: "search", query: debouncedQuery },
              list,
              index < 0 ? 0 : index,
            );
          },
          isFavorite: favoriteProps.isFavorite(song.id),
          onToggleFavorite: () => favoriteProps.onToggleFavorite(song),
          onAddToPlaylist: () => handleAddToPlaylist(song),
          disabled: actionsDisabled,
        })}
      />
    );
  } else if (selectedArtistId) {
    const list = artistSongsQuery.data ?? [];
    if (artistSongsQuery.isLoading) {
      body = <LoadingState label="गीतहरू लोड हुँदैछ…" />;
    } else if (artistSongsQuery.isError) {
      body = (
        <ErrorState
          title="गीतहरू लोड गर्न सकिएन"
          description="कलाकारका गीतहरू ल्याउने क्रममा केही गडबड भयो।"
          onRetry={() => void artistSongsQuery.refetch()}
        />
      );
    } else if (list.length === 0) {
      body = (
        <EmptyState
          icon={Music2}
          title="कुनै गीत छैन"
          description="यस कलाकारका गीतहरू भेटिएनन्।"
        />
      );
    } else {
      body = (
        <SongRows
          songs={list}
          artistPhotoUrl={selectedArtist?.photoUrl}
          isFavorite={favoriteProps.isFavorite}
          onToggleFavorite={favoriteProps.onToggleFavorite}
          onAddToPlaylist={handleAddToPlaylist}
          disabled={actionsDisabled}
          onOpen={(song, index) =>
            openSongList(
              { type: "artist", artistId: selectedArtistId },
              list,
              index,
            )
          }
        />
      );
    }
  } else if (categorySongs.isLoading) {
    body = <LoadingState label="गीतहरू लोड हुँदैछ…" />;
  } else if (categorySongs.isError) {
    body = (
      <ErrorState
        title="गीतहरू लोड गर्न सकिएन"
        description="गीतहरू ल्याउने क्रममा केही गडबड भयो।"
        onRetry={() => void categorySongs.refetch()}
      />
    );
  } else if (categorySongList.length === 0) {
    body = (
      <EmptyState
        icon={Music2}
        title="कुनै गीत छैन"
        description="यस श्रेणीमा अहिलेसम्म गीतहरू छैनन्।"
      />
    );
  } else {
    body = (
      <>
        <SongRows
          songs={categorySongList}
          isFavorite={favoriteProps.isFavorite}
          onToggleFavorite={favoriteProps.onToggleFavorite}
          onAddToPlaylist={handleAddToPlaylist}
          disabled={actionsDisabled}
          onOpen={(song, index) =>
            openSongList({ type: "category", category }, categorySongList, index)
          }
        />
        {categorySongs.hasNextPage ? (
          <div className="pt-4 text-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void categorySongs.fetchNextPage()}
              disabled={categorySongs.isFetchingNextPage}
            >
              {categorySongs.isFetchingNextPage ? "Loading…" : "Load more"}
            </Button>
          </div>
        ) : null}
      </>
    );
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto w-full max-w-6xl space-y-3 px-4 pb-3 pt-3">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl font-bold">Songs</h1>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setArtistPanelOpen((open) => !open)}
              aria-expanded={artistPanelOpen}
            >
              <MicVocal className="size-4" aria-hidden />
              {selectedArtist ? selectedArtist.name : "Artists"}
            </Button>
          </div>

          <SearchBar
            value={searchQuery}
            onValueChange={setQuery}
            onClear={handleSearchClear}
            onSubmit={handleSearchSubmit}
          />

          <CategorySelector
            categories={SONG_CATEGORIES}
            selected={category}
            onSelect={handleCategory}
            disabled={isSearching}
          />

          {artistPanelOpen ? (
            <div className="rounded-xl border bg-card p-2">
              <p className="px-3 pb-1 text-xs font-medium text-muted-foreground">
                Filter by artist
              </p>
              <ArtistSelector
                artists={artists}
                selectedId={selectedArtistId}
                onSelect={handleArtistSelect}
                className="max-h-56"
              />
            </div>
          ) : null}

          {selectedArtistId && selectedArtist ? (
            <div className="flex items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <Avatar
                  src={selectedArtist.photoUrl}
                  name={selectedArtist.name}
                  size="sm"
                />
                <span className="truncate text-sm font-medium">
                  {selectedArtist.name}
                </span>
              </div>
              <button
                type="button"
                onClick={clearArtistFilter}
                aria-label="Clear artist filter"
                className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 py-6">{body}</div>

      <AddToPlaylistFlow
        song={addToPlaylistSong}
        onClose={() => setAddToPlaylistSong(null)}
      />
    </div>
  );
}

interface SongRowsProps {
  songs: Song[];
  artistPhotoUrl?: string;
  isFavorite: (songId: string) => boolean;
  onToggleFavorite: (song: Song) => void;
  onOpen: (song: Song, index: number) => void;
  onAddToPlaylist?: (song: Song) => void;
  /** Disables the favorite + add-to-playlist actions (signed-out users). */
  disabled?: boolean;
}

/**
 * SongRows — the shared song list body (page-local composition). Reuses the
 * library `SongListItem` row so the category/artist lists never duplicate
 * rendering; favorite, add-to-playlist and open interactions are delegated
 * via props.
 */
function SongRows({
  songs,
  artistPhotoUrl,
  isFavorite,
  onToggleFavorite,
  onOpen,
  onAddToPlaylist,
  disabled,
}: SongRowsProps) {
  return (
    <ul className="divide-y divide-border">
      {songs.map((song, index) => (
        <li key={song.id}>
          <SongListItem
            song={song}
            index={index}
            artistPhotoUrl={artistPhotoUrl}
            onOpen={() => onOpen(song, index)}
            isFavorite={isFavorite(song.id)}
            onToggleFavorite={() => onToggleFavorite(song)}
            onAddToPlaylist={onAddToPlaylist ? () => onAddToPlaylist(song) : undefined}
            disabled={disabled}
          />
        </li>
      ))}
    </ul>
  );
}
