"use client";

import { useMemo } from "react";
import { BookOpen } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { DEFAULT_BIBLE_VERSION } from "../constants";
import { useAudioBible, useDeepLink, useReadingPosition } from "../hooks";
import { useBible, useBooks, useChapterContent } from "../queries";
import { useReaderSettings, useReadingStore } from "../store";
import { clampChapter, nextChapter, prevChapter } from "../utils";
import {
  bibleLinkPosition,
  bibleLinkVersionId,
  type BibleLinkPosition,
} from "../utils/deep-link";
import { ChapterViewer } from "./chapter-viewer";
import { AudioIndicator } from "./reader/audio-indicator";
import { ReaderToolbar } from "./reader/reader-toolbar";
import { ReadingProgressIndicator } from "./reader/reading-progress-indicator";

/**
 * BibleHome — the page-level orchestration for the Bible reader.
 *
 * Replaces the Flutter `BibleHome` (`lib/bible/bible_home.dart`): it wires the
 * reader chrome (progress, audio, toolbar) around the chapter body and the
 * prev/next navigation. It is deliberately thin — every responsibility is
 * delegated to existing hooks/stores/utilities and to the presentational
 * `ChapterViewer`; no business logic, parsing or direct verse rendering
 * happens here.
 *
 * Responsibilities:
 *   1. Read route parameters (book/chapter/verse/version) from the deep link.
 *   2. Read reader settings (store) and drive ReaderToolbar + parse options.
 *   3. Call the existing React Query hooks (books, version, chapter content).
 *   4/5/6. Loading / error / empty states.
 *   7. Pass data into ChapterViewer (content, version, books, options, nav).
 *   8. Connect ReaderToolbar, AudioIndicator, ReadingProgressIndicator.
 *   9/10/11. Chapter navigation + browser history + deep links (URL is the
 *      source of truth on /bible routes; the reading store mirrors it via
 *      useDeepLink, and progress is persisted via useReadingPosition).
 *   12. Responsive layout (sticky chrome, single column → grid with panels).
 *   13. Future panels (split view, parallel, dictionaries, commentary, notes,
 *      search) render into the `panels` slot without architectural changes.
 */

export interface BibleHomeProps {
  /** Future: side panels (commentary, notes, dictionary, search, parallel). */
  panels?: React.ReactNode;
}

export function BibleHome({ panels }: BibleHomeProps) {
  // 1. Route parameters — parsed from the URL; null off /bible routes.
  const { currentLink, navigate } = useDeepLink();
  // Fallback reading state (used when no /bible route is active; useDeepLink
  // keeps this store in sync with the URL).
  const {
    versionId: storeVersionId,
    bookNumber,
    chapter,
    verse,
  } = useReadingStore();

  // 2. Reader settings.
  const settings = useReaderSettings();

  // 3. Existing React Query hooks.
  const { data: books } = useBooks();
  const versionId = bibleLinkVersionId(currentLink) ?? storeVersionId;
  const { data: version } = useBible(versionId);

  // Effective position: route params win, else the store; clamped to canon.
  const position = useMemo<BibleLinkPosition>(() => {
    const base = bibleLinkPosition(currentLink) ?? {
      bookNumber,
      chapter,
      verse,
    };
    if (!books) return base;
    return { ...clampChapter(base, books), verse: base.verse };
  }, [currentLink, books, bookNumber, chapter, verse]);

  const chapterQuery = useChapterContent(
    versionId,
    position.bookNumber,
    position.chapter,
    {
      includeCrossRefs: settings.showCrossReferences,
      includeCommentary: settings.showComments,
      enabled: Boolean(versionId && position.bookNumber && position.chapter),
    },
  );

  const { openChapter } = useReadingPosition();
  const { isPlaying, toggle, playChapter } = useAudioBible();

  const book = useMemo(
    () => books?.find((entry) => entry.bookNumber === position.bookNumber),
    [books, position.bookNumber],
  );

  // 9/10/11. Navigation — targets computed with the shared pure utilities,
  // then applied to the URL (history/deep link) and persisted (openChapter).
  const canGoPrevious = useMemo(
    () => Boolean(books && prevChapter(position, books)),
    [books, position],
  );
  const canGoNext = useMemo(
    () => Boolean(books && nextChapter(position, books)),
    [books, position],
  );

  const goTo = (target: { bookNumber: number; chapter: number }, nextVerse?: number) => {
    openChapter(target.bookNumber, target.chapter, nextVerse);
    navigate(
      nextVerse
        ? {
            kind: "verse",
            bookNumber: target.bookNumber,
            chapter: target.chapter,
            verse: nextVerse,
            versionId,
          }
        : {
            kind: "chapter",
            bookNumber: target.bookNumber,
            chapter: target.chapter,
            versionId,
          },
    );
  };
  const handlePrevious = () => {
    const target = books && prevChapter(position, books);
    if (target) goTo(target);
  };
  const handleNext = () => {
    const target = books && nextChapter(position, books);
    if (target) goTo(target);
  };

  // Settings → verse engine options (parser stays out of the page).
  const parseOptions = useMemo(
    () => ({
      redLetters: settings.redLetters,
      verseNumber: settings.showVerseNumbers,
    }),
    [settings.redLetters, settings.showVerseNumbers],
  );

  // 8. Audio indicator toggles play for the current chapter when stopped.
  const handleAudioToggle = () => {
    if (isPlaying) toggle();
    else playChapter();
  };

  // 4/5/6. Loading / error / empty states.
  let body: React.ReactNode;
  if (chapterQuery.isLoading) {
    body = <LoadingState label="अध्याय लोड हुँदैछ…" />;
  } else if (chapterQuery.isError) {
    body = (
      <ErrorState
        title="अध्याय लोड गर्न सकिएन"
        description="यो अध्याय पढ्ने क्रममा केही गडबड भयो। पुनः प्रयास गर्नुहोस्।"
        onRetry={() => void chapterQuery.refetch()}
      />
    );
  } else if (!chapterQuery.data || chapterQuery.data.verses.length === 0) {
    body = (
      <EmptyState
        icon={BookOpen}
        title="यो अध्याय खाली छ"
        description="यस स्थानमा पढ्न मिल्ने कुनै पद फेला परेन।"
      />
    );
  } else {
    // 7. Pass data into ChapterViewer (no rendering/parsing here).
    body = (
      <ChapterViewer
        content={chapterQuery.data}
        version={version ?? DEFAULT_BIBLE_VERSION}
        books={books}
        parseOptions={parseOptions}
        onPreviousChapter={handlePrevious}
        onNextChapter={handleNext}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
      />
    );
  }

  // 12/13. Responsive shell: sticky reader chrome + chapter body + optional
  // future panels slot.
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto w-full max-w-6xl px-4 pb-2 pt-3">
          <div className="flex items-center justify-between gap-3">
            <ReadingProgressIndicator
              current={position.chapter}
              total={book?.chapters ?? 0}
              className="flex-1"
            />
            <AudioIndicator
              isPlaying={isPlaying}
              onToggle={handleAudioToggle}
              disabled={!book}
            />
          </div>
          <ReaderToolbar
            fontSize={settings.fontSize}
            lineHeight={settings.lineHeight}
            alignment={settings.alignment}
            redLetters={settings.redLetters}
            showComments={settings.showComments}
            showCrossReferences={settings.showCrossReferences}
            showVerseNumbers={settings.showVerseNumbers}
            onFontSizeChange={settings.setFontSize}
            onLineHeightChange={settings.setLineHeight}
            onAlignmentChange={settings.setAlignment}
            onRedLettersChange={settings.setRedLetters}
            onCommentsChange={settings.setShowComments}
            onCrossReferencesChange={settings.setShowCrossReferences}
            onVerseNumbersChange={settings.setShowVerseNumbers}
          />
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <main
          className="min-w-0"
          style={{
            fontSize: settings.fontSize,
            lineHeight: settings.lineHeight,
            textAlign: settings.alignment,
          }}
        >
          {body}
        </main>
        {panels ? (
          <aside className="hidden lg:block" aria-label="Reader panels">
            {panels}
          </aside>
        ) : null}
      </div>
    </div>
  );
}
