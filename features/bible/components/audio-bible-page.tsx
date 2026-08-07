"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Headphones, ListMusic, Play } from "lucide-react";
import { toast } from "sonner";
import { useAudioPlayerStore } from "@features/audio";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DEFAULT_BIBLE_VERSION,
  DEFAULT_BOOK_NUMBER,
  DEFAULT_CHAPTER_NUMBER,
} from "../constants";
import { useBibleNavigation } from "../hooks";
import { useBooks, useChapterAudio, useBookAudios } from "../queries";
import { useReadingStore } from "../store";
import { toBibleAudioItem, toBibleAudioItems, toNepaliDigits } from "../utils";
import { BibleVersionPicker } from "./selection/bible-version-picker";
import { BookPicker } from "./selection/book-picker";
import { ChapterPicker } from "./selection/chapter-picker";

/**
 * AudioBiblePage — the `/audio-bible` route.
 *
 * A simple, compose-only page that reuses the existing Bible selectors and
 * the shared Audio Platform:
 *   - Version / Book / Chapter come from the REUSED `BibleVersionPicker`,
 *     `BookPicker` and `ChapterPicker` (controlled via props — no duplicated
 *     selection UI), and the URL (`?book=&chapter=&v=`) is the source of
 *     truth so refresh + browser back/forward work.
 *   - Playback reuses the shared Audio Platform: selecting a chapter queues
 *     its audio file and plays immediately; "Play Book" queues every chapter
 *     of the book in order (Genesis 1, 2, 3, …). The floating
 *     `MiniAudioPlayer` appears automatically and opens the `FullAudioPlayer`
 *     — no new player, no new playback state (play/pause/seek/speed/shuffle/
 *     repeat/queue all live in the platform).
 *   - "Open in Bible" navigates through the EXISTING `useBibleNavigation`
 *     to the real `/bible/{book}/{chapter}` chapter.
 *
 * Queue construction: `playQueue([toBibleAudioItem(track)])` for a chapter
 * and `playQueue(toBibleAudioItems(tracks))` for a book — both handed
 * straight to the platform's `playQueue` (AudioEngine), never duplicated.
 * Note: audio is bound to the NNRV `nnrv_audios` table (the only audio
 * source in the backend); the version selector controls the navigation
 * version / URL, not the audio files.
 */
export function AudioBiblePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL is the source of truth for the selection.
  const bookNumber = Number(searchParams.get("book")) || DEFAULT_BOOK_NUMBER;
  const chapter =
    Number(searchParams.get("chapter")) || DEFAULT_CHAPTER_NUMBER;
  const versionId = searchParams.get("v") || DEFAULT_BIBLE_VERSION.id;

  // Shared Audio Platform — targeted subscriptions (no per-tick re-renders of
  // the whole page) + the stable playQueue action.
  const currentItem = useAudioPlayerStore((state) => state.currentItem);
  const queueLength = useAudioPlayerStore((state) => state.queue.length);
  const isPlaying = useAudioPlayerStore((state) => state.isPlaying);
  const playQueue = useAudioPlayerStore((state) => state.playQueue);

  const { data: books } = useBooks();
  const selectedBook = books?.find((book) => book.bookNumber === bookNumber);
  const { data: chapterTrack } = useChapterAudio(bookNumber, chapter);
  const { data: bookTracks } = useBookAudios(bookNumber);

  // Auto-play the chapter the user just picked (the explicit Play Chapter
  // button re-uses the same queue builder — no duplicated queue logic). A ref
  // tracks the pending selection so the effect can consume it without
  // setState-in-effect.
  const pendingAutoPlayRef = useRef<number | null>(null);

  const updateUrl = useCallback(
    (next: { bookNumber?: number; chapter?: number; versionId?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.bookNumber !== undefined)
        params.set("book", String(next.bookNumber));
      if (next.chapter !== undefined)
        params.set("chapter", String(next.chapter));
      if (next.versionId !== undefined) params.set("v", next.versionId);
      const qs = params.toString();
      router.push(qs ? `/audio-bible?${qs}` : "/audio-bible", {
        scroll: false,
      });
    },
    [router, searchParams],
  );

  const handleVersionChange = useCallback(
    (id: string) => updateUrl({ versionId: id }),
    [updateUrl],
  );

  const handleBookSelect = useCallback(
    (book: number) =>
      updateUrl({ bookNumber: book, chapter: DEFAULT_CHAPTER_NUMBER }),
    [updateUrl],
  );

  const handleChapterSelect = useCallback(
    (ch: number) => {
      pendingAutoPlayRef.current = ch;
      updateUrl({ chapter: ch });
    },
    [updateUrl],
  );

  /** Queue the chapter's audio file and play (the single queue builder). */
  const playChapter = useCallback(() => {
    if (!chapterTrack) return;
    playQueue([toBibleAudioItem(chapterTrack)]);
  }, [chapterTrack, playQueue]);

  // Selecting a chapter plays immediately (per the spec) once its track is
  // available; back/forward URL changes do NOT auto-play.
  useEffect(() => {
    if (pendingAutoPlayRef.current === null) return;
    if (pendingAutoPlayRef.current !== chapter) return;
    if (chapterTrack === undefined) return; // track still loading
    pendingAutoPlayRef.current = null;
    if (chapterTrack) playChapter();
  }, [chapter, chapterTrack, playChapter]);

  /** Queue every chapter of the book in order (Genesis 1, 2, 3, …). */
  const playBook = useCallback(() => {
    const tracks = bookTracks ?? [];
    if (tracks.length === 0) {
      toast.info("No audio available for this book.");
      return;
    }
    playQueue(toBibleAudioItems(tracks));
  }, [bookTracks, playQueue]);

  const { goTo } = useBibleNavigation();
  const openInBible = useCallback(() => {
    useReadingStore.getState().setVersion(versionId);
    goTo(bookNumber, chapter);
  }, [goTo, versionId, bookNumber, chapter]);

  const chapterLabel = selectedBook
    ? `${selectedBook.longName} ${toNepaliDigits(chapter)}`
    : toNepaliDigits(chapter);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto w-full max-w-6xl space-y-3 px-4 pb-3 pt-3">
          <div className="flex items-center justify-between gap-3">
            <h1 className="flex items-center gap-2 text-xl font-bold">
              <Headphones className="size-5 text-primary" aria-hidden />
              Audio Bible
            </h1>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openInBible}
            >
              <BookOpen className="size-4" aria-hidden />
              Open in Bible
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Version
            </span>
            <BibleVersionPicker
              value={versionId}
              onVersionChange={handleVersionChange}
              className="w-64"
            />
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardContent className="p-4">
              <h2 className="mb-3 text-base font-semibold">Book</h2>
              <BookPicker
                value={bookNumber}
                onSelect={handleBookSelect}
                className="max-h-80"
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h2 className="mb-3 text-base font-semibold">Chapter</h2>
              <ChapterPicker
                book={selectedBook}
                value={chapter}
                onSelect={handleChapterSelect}
                className="max-h-80"
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={playChapter}
            disabled={!chapterTrack}
          >
            <Play className="size-4" aria-hidden />
            {chapterTrack
              ? `Play Chapter — ${chapterLabel}`
              : "Play Chapter"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={playBook}
            disabled={(bookTracks ?? []).length === 0}
          >
            <ListMusic className="size-4" aria-hidden />
            Play Book
          </Button>
        </div>

        <Card>
          <CardContent className="p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Now Playing
            </h2>
            {currentItem ? (
              <div className="mt-2">
                <p className="font-medium text-foreground">
                  {currentItem.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {queueLength} {queueLength === 1 ? "track" : "tracks"} ·{" "}
                  {isPlaying ? "Playing" : "Paused"}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Nothing playing. Choose a chapter or press Play Book.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
