"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Music, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useAudioLibrary, useAudioPlayback } from "../hooks";
import { AudioCard } from "./audio-card";
import { AudioFilters } from "./audio-filters";
import { AudioSearchBar } from "./audio-search-bar";

/**
 * AudioListPage — the page-level orchestration for the Online Songs library
 * (the web replacement of `AudiosListPage` in `lib/audios/audios_list_page.dart`):
 * the paginated list, client-side search + category filters, loading/error/
 * empty states, the admin "Add" entry, per-card edit/delete, and the shared
 * `AudioPlayerHost` (mini player) at the bottom.
 *
 * Playback is fully delegated to the shared Audio Platform via
 * `useAudioPlayback` (queue + play/pause); this page never implements
 * playback. Cards are memoized and receive stable props, so only the playing
 * card re-renders on position ticks.
 */
export function AudioListPage() {
  const router = useRouter();
  const {
    audios,
    isLoading,
    isError,
    error,
    hasMore,
    isLoadingMore,
    loadMore,
    refetch,
    query,
    setQuery,
    category,
    setCategory,
    categories,
    canManage,
    deleteAudio,
  } = useAudioLibrary();
  const { toggleAudio } = useAudioPlayback();

  const handleDelete = useCallback(
    (id: string) => {
      const audio = audios.find((entry) => entry.id === id);
      if (!audio) return;
      deleteAudio(audio);
      toast.success("Audio deleted");
    },
    [audios, deleteAudio],
  );

  const filtering = query.trim().length > 0 || category !== "all";

  let body: React.ReactNode;
  if (isLoading) {
    body = <LoadingState label="Loading audios…" />;
  } else if (isError) {
    body = (
      <ErrorState
        title="Failed to load audios"
        description={error instanceof Error ? error.message : "Something went wrong."}
        onRetry={refetch}
      />
    );
  } else if (audios.length === 0) {
    body = (
      <EmptyState
        icon={Music}
        title={filtering ? "No audios found" : "No audios yet"}
        description={
          filtering
            ? "Try a different search or category."
            : "The library is empty."
        }
      />
    );
  } else {
    body = (
      <>
        <ul className="space-y-3">
          {audios.map((audio, index) => (
            <li key={audio.id}>
              <AudioCard
                audio={audio}
                canManage={canManage}
                onToggle={() => toggleAudio(audios, index)}
                onEdit={() => router.push(`/songs/edit/${audio.id}`)}
                onDelete={() => handleDelete(audio.id)}
              />
            </li>
          ))}
        </ul>
        {hasMore ? (
          <div className="pt-4 text-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? "Loading…" : "Load more"}
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
            <h1 className="text-xl font-bold">Audio Library</h1>
            {canManage ? (
              <Button
                type="button"
                size="sm"
                onClick={() => router.push("/songs/new")}
              >
                <Plus aria-hidden />
                Add Audio
              </Button>
            ) : null}
          </div>
          <AudioSearchBar
            value={query}
            onValueChange={setQuery}
            onClear={() => setQuery("")}
          />
          <AudioFilters
            categories={categories}
            selected={category}
            onSelect={setCategory}
          />
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 py-6">{body}</div>
    </div>
  );
}
