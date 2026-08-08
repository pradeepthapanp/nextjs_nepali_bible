"use client";

import { useEffect, useMemo } from "react";
import { BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import {
  RelatedLinks,
  type RelatedLinkItem,
} from "@/components/related/related-links";
import { ARTICLE_CATEGORY_LABELS } from "@features/articles/constants";
import { useArticlesByRelatedChapter } from "@features/articles/queries";
import { DEFAULT_BIBLE_VERSION } from "../constants";
import { useAudioBible, useBibleNavigation, useDeepLink } from "../hooks";
import {
  useBible,
  useBibles,
  useBooks,
  useChapterContent,
  useCommentaryHasContent,
  useCommentaryVersions,
  useVersionHasVerses,
} from "../queries";
import {
  useBibleSelectionStore,
  useReaderSettings,
  useReadingStore,
  useVerseInteractionStore,
} from "../store";
import { VerseInteractionHost } from "./interaction";
import { BibleSelectionDialog } from "./selection";
import {
  canonicalNumber,
  clampChapter,
  nextChapter,
  prevChapter,
  readerFontStack,
} from "../utils";
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
  const t = useTranslations("bible");
  // 1. Route parameters — parsed from the URL; null off /bible routes.
  const { currentLink } = useDeepLink();
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
  const { data: versions } = useBibles();
  const { data: commentaries } = useCommentaryVersions();
  // Lightweight content checks — detect versions/commentaries whose data table
  // is empty (e.g. NEPS / MacArthur not imported yet) so the UI can say so.
  const { data: versionHasVerses } = useVersionHasVerses(versionId);
  const { data: commentaryHasContent } = useCommentaryHasContent(
    settings.commentaryId,
  );

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

  // Verse Interaction: changing chapter / book / Bible version clears the
  // current selection (mirrors Flutter's auto-clear in VerseSelectionNotifier).
  const clearInteraction = useVerseInteractionStore((state) => state.clear);
  useEffect(() => {
    clearInteraction();
  }, [clearInteraction, position.bookNumber, position.chapter, versionId]);

  const chapterQuery = useChapterContent(
    versionId,
    position.bookNumber,
    position.chapter,
    {
      includeCrossRefs: settings.showCrossReferences,
      includeCommentary: settings.showComments,
      commentaryId: settings.commentaryId,
      enabled: Boolean(versionId && position.bookNumber && position.chapter),
    },
  );

  // Related articles — published articles tagged with the CURRENT chapter via
  // the existing `related_book_number`/`related_chapter` columns (the reverse
  // of an article's "Related Bible chapter"). Articles store the CANONICAL
  // book number (1..66), so the app's book number is converted first. Queried
  // only while a chapter is rendered; the section hides itself when empty.
  const { data: relatedArticles } = useArticlesByRelatedChapter(
    chapterQuery.data && books
      ? canonicalNumber(books, position.bookNumber)
      : undefined,
    chapterQuery.data ? position.chapter : undefined,
  );
  const relatedArticleLinks: RelatedLinkItem[] = (relatedArticles ?? []).map(
    (article) => ({
      href: `/articles/${article.id}`,
      label: article.title,
      description: ARTICLE_CATEGORY_LABELS[article.category],
    }),
  );

  const { goTo, goToVersion } = useBibleNavigation();
  const openSelection = useBibleSelectionStore((state) => state.openDialog);
  // Play audio for the chapter currently on screen (URL position wins).
  const { isPlaying, toggle } = useAudioBible(
    position.bookNumber,
    position.chapter,
  );

  const book = useMemo(
    () => books?.find((entry) => entry.bookNumber === position.bookNumber),
    [books, position.bookNumber],
  );

  // 9/10/11. Navigation — targets computed with the shared pure utilities,
  // then applied through `useBibleNavigation` (URL + history + persisted
  // position + recents). Single navigation entry point — no duplication.
  const canGoPrevious = useMemo(
    () => Boolean(books && prevChapter(position, books)),
    [books, position],
  );
  const canGoNext = useMemo(
    () => Boolean(books && nextChapter(position, books)),
    [books, position],
  );

  const handlePrevious = () => {
    const target = books && prevChapter(position, books);
    if (target) goTo(target.bookNumber, target.chapter);
  };
  const handleNext = () => {
    const target = books && nextChapter(position, books);
    if (target) goTo(target.bookNumber, target.chapter);
  };

  // Settings → verse engine options (parser stays out of the page).
  const parseOptions = useMemo(
    () => ({
      redLetters: settings.redLetters,
      verseNumber: settings.showVerseNumbers,
    }),
    [settings.redLetters, settings.showVerseNumbers],
  );

  // 4/5/6. Loading / error / empty states.
  let body: React.ReactNode;
  if (chapterQuery.isLoading) {
    body = <LoadingState label={t("loadingChapter")} />;
  } else if (chapterQuery.isError) {
    body = (
      <ErrorState
        title={t("couldntLoadChapter")}
        description={t("couldntLoadChapterDesc")}
        onRetry={() => void chapterQuery.refetch()}
      />
    );
  } else if (!chapterQuery.data || chapterQuery.data.verses.length === 0) {
    body =
      versionHasVerses === false ? (
        <EmptyState
          icon={BookOpen}
          title={t("versionEmpty")}
          description={t("versionEmptyDesc", { name: version?.name ?? "" })}
        />
      ) : (
        <EmptyState
          icon={BookOpen}
          title={t("emptyChapter")}
          description={t("emptyChapterDesc")}
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
        onOpenBook={() => openSelection("book")}
        onOpenChapter={() => openSelection("chapter")}
        // Reference links open the referenced passage in the reader (port of
        // the Flutter `ReferenceVersesSheet` / `CmtParser.openReference`
        // navigation). All three go through the single `goTo` entry point.
        onOpenCommentary={(entry) =>
          goTo(
            entry.bookNumber,
            entry.chapterNumberFrom ?? 1,
            entry.verseNumberFrom ?? 1,
          )
        }
        onOpenCrossReference={(reference) =>
          goTo(
            reference.bookTo,
            reference.chapterTo,
            reference.verseToStart ?? reference.verseToEnd ?? 1,
          )
        }
        onOpenReference={(reference) =>
          goTo(reference.bookNumber, reference.chapter, reference.verse ?? 1)
        }
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
              onToggle={toggle}
              disabled={!book}
            />
          </div>
          <ReaderToolbar
            fontSize={settings.fontSize}
            lineHeight={settings.lineHeight}
            paragraphSpacing={settings.paragraphSpacing}
            fontFamily={settings.fontFamily}
            alignment={settings.alignment}
            theme={settings.theme}
            redLetters={settings.redLetters}
            showComments={settings.showComments}
            showCrossReferences={settings.showCrossReferences}
            showVerseNumbers={settings.showVerseNumbers}
            versionId={versionId ?? DEFAULT_BIBLE_VERSION.id}
            versions={versions ?? []}
            onVersionChange={goToVersion}
            commentaryId={settings.commentaryId}
            commentaries={commentaries ?? []}
            onCommentaryChange={settings.setCommentaryId}
            onFontSizeChange={settings.setFontSize}
            onLineHeightChange={settings.setLineHeight}
            onParagraphSpacingChange={settings.setParagraphSpacing}
            onFontFamilyChange={settings.setFontFamily}
            onAlignmentChange={settings.setAlignment}
            onThemeChange={settings.setTheme}
            onRedLettersChange={settings.setRedLetters}
            onCommentsChange={settings.setShowComments}
            onCrossReferencesChange={settings.setShowCrossReferences}
            onVerseNumbersChange={settings.setShowVerseNumbers}
          />
        </div>
      </header>

      {settings.showComments && commentaryHasContent === false ? (
        <div className="mx-auto w-full max-w-6xl px-4 pt-4">
          <p
            role="status"
            className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
          >
            {t("commentaryEmpty", {
              name:
                commentaries?.find((c) => c.id === settings.commentaryId)?.name ??
                "",
            })}
          </p>
        </div>
      ) : null}

      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <main
          className="min-w-0"
          style={
            {
              fontSize: settings.fontSize,
              lineHeight: settings.lineHeight,
              textAlign: settings.alignment,
              fontFamily: readerFontStack(settings.fontFamily),
              "--reader-paragraph-spacing": `${settings.paragraphSpacing}px`,
              // Exposes the verse font size so derived text (e.g. commentary)
              // can track it (commentary = verse size − 2px).
              "--reader-font-size": `${settings.fontSize}px`,
            } as React.CSSProperties
          }
        >
          {body}
          <RelatedLinks title={t("relatedArticles")} links={relatedArticleLinks} />
        </main>
        {panels ? (
          <aside className="hidden lg:block" aria-label="Reader panels">
            {panels}
          </aside>
        ) : null}
      </div>

      <BibleSelectionDialog />
      <VerseInteractionHost />
    </div>
  );
}
