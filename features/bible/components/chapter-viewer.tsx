"use client";

import { useMemo } from "react";
import { cn } from "@/utils/cn";
import {
  formatCrossReferences,
  parseChapterContent,
  type ParsedChapter,
  type ParsedChapterCommentary,
  type ReferenceLinkNode,
  type RendererRegistry,
  type TitleRenderTree,
  type VerseParseOptions,
} from "@features/bible/parsers";
import type {
  Book,
  BibleVersion,
  ChapterContent,
  CommentaryEntry,
  CrossReference,
  HighlightColor,
} from "@features/bible/types";
import { toNepaliDigits } from "@features/bible/utils";
import { ChapterContainer } from "./chapter/chapter-container";
import { ChapterFooter } from "./chapter/chapter-footer";
import { ChapterHeader } from "./chapter/chapter-header";
import { VerseRenderProvider, useVerseRender } from "./context";
import { createVerseRendererRegistry } from "./registry";
import {
  VerseActions,
  VerseCommentaryMarker,
  VerseContainer,
  VerseReferenceChip,
  VerseSelectionOverlay,
} from "./verse";

/**
 * ChapterViewer — the reusable composition layer between the data layer and
 * the page.
 *
 * Replaces the Flutter `VerDisplay` / `SingleChapterDisplay` composition
 * (`lib/bible/ver_display.dart`, `lib/bible/single_chapter_display.dart`),
 * which associated titles, commentary and cross-references with each verse
 * and rendered `TitleParser` + `FullVerParse` rows inside a `ListView`.
 *
 * Responsibilities:
 *   - Receive `ChapterContent` (from `useChapterContent`), the selected
 *     `BibleVersion`, the canonical `books`, and parse options — ALL via props.
 *   - Produce the parser output through `parseChapterContent` (or accept a
 *     pre-computed `parsed` tree) and render it using ONLY the reusable
 *     verse/chapter components and the verse renderer registry.
 *   - Compose: `ChapterHeader`, per-verse `VerseContainer` (+ `VerseActions`,
 *     `VerseSelectionOverlay`, titles, commentary markers/blocks, cross-ref
 *     chips), and `ChapterFooter`.
 *
 * It does NOT fetch data, call Supabase, or call React Query. Business logic
 * (selection state, highlighting, notes, audio sync, navigation) lives in the
 * hooks and stores and is wired in through props/callbacks, so future features
 * (verse selection, multiple selection, highlights, notes, audio sync, search
 * highlighting, parallel Bible, commentary, dictionaries) require no changes
 * here.
 */

export interface ChapterViewerProps {
  /** Chapter data from `useChapterContent`. */
  content: ChapterContent;
  /** The selected Bible version (exposed for audio/parallel/dictionary sync). */
  version: BibleVersion;
  /** Canonical book list — resolves book names in titles/commentary/refs. */
  books?: Book[];
  /** Options forwarded to the verse engine (redLetters, searchQuery, plugins). */
  parseOptions?: VerseParseOptions;
  /** Pre-computed parser output; when omitted it is derived from `content`. */
  parsed?: ParsedChapter;
  /** Custom renderer registry; defaults to the standard verse registry. */
  registry?: RendererRegistry<React.ReactNode>;

  // ---- display state (future features) ----
  /** Verse ids in the current selection (drives the selection overlay). */
  selectedVerseIds?: ReadonlySet<string>;
  /** Whole-verse highlights keyed by verse id. */
  highlights?: Record<string, HighlightColor>;
  /** Verse id being read aloud (audio sync) — drives the active ring. */
  activeVerseId?: string;

  // ---- callbacks (business logic lives in hooks) ----
  /** Toggles verse selection (Enter/Space or click on the verse). */
  onSelectVerse?: (verseId: string) => void;
  onOpenBook?: () => void;
  onOpenChapter?: () => void;
  onCopyVerse?: (verseId: string) => void;
  onHighlightVerse?: (verseId: string) => void;
  onNoteVerse?: (verseId: string) => void;
  onShareVerse?: (verseId: string) => void;
  onBookmarkVerse?: (verseId: string) => void;
  /** Opens the commentary anchored at this verse's marker. */
  onOpenCommentary?: (entry: CommentaryEntry) => void;
  /** Opens the reference sheet for a cross-reference chip. */
  onOpenCrossReference?: (reference: CrossReference) => void;
  onPreviousChapter?: () => void;
  onNextChapter?: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;

  className?: string;
}

export function ChapterViewer({
  content,
  version,
  books,
  parseOptions,
  parsed,
  registry,
  selectedVerseIds,
  highlights,
  activeVerseId,
  onSelectVerse,
  onOpenBook,
  onOpenChapter,
  onCopyVerse,
  onHighlightVerse,
  onNoteVerse,
  onShareVerse,
  onBookmarkVerse,
  onOpenCommentary,
  onOpenCrossReference,
  onPreviousChapter,
  onNextChapter,
  canGoPrevious,
  canGoNext,
  className,
}: ChapterViewerProps) {
  // Single source of truth for the parser output: a caller-provided tree wins,
  // otherwise we derive it from `content` (pure, memoised).
  const chapter = useMemo(
    () =>
      parsed ?? parseChapterContent(content, { books, verse: parseOptions }),
    [parsed, content, books, parseOptions],
  );

  // Resolve the renderer registry: a caller-provided registry wins, otherwise
  // the standard verse registry is created here so ChapterViewer is fully
  // self-contained (no reliance on module-load side effects from the barrel).
  const resolvedRegistry = useMemo(
    () => registry ?? createVerseRendererRegistry(),
    [registry],
  );

  const bookName = useMemo(
    () =>
      books?.find((book) => book.bookNumber === content.bookNumber)?.longName ??
      String(content.bookNumber),
    [books, content.bookNumber],
  );

  const body = (
    <ChapterContainer dataVersionId={version.id} className={className}>
      <ChapterHeader
        bookName={bookName}
        chapterNumber={content.chapter}
        onOpenBook={onOpenBook}
        onOpenChapter={onOpenChapter}
      />

      {chapter.verses.map((item) => (
        <ChapterVerse
          key={item.verse.uuid}
          item={item}
          books={books ?? []}
          selected={selectedVerseIds?.has(item.verse.uuid) ?? false}
          highlight={highlights?.[item.verse.uuid]}
          active={activeVerseId === item.verse.uuid}
          onSelect={onSelectVerse}
          onCopy={onCopyVerse}
          onHighlight={onHighlightVerse}
          onNote={onNoteVerse}
          onShare={onShareVerse}
          onBookmark={onBookmarkVerse}
          onOpenCommentary={onOpenCommentary}
          onOpenCrossReference={onOpenCrossReference}
        />
      ))}

      <ChapterFooter
        onPrevious={onPreviousChapter}
        onNext={onNextChapter}
        canPrevious={canGoPrevious}
        canNext={canGoNext}
        label={`${bookName} ${toNepaliDigits(content.chapter)}`}
      />
    </ChapterContainer>
  );

  // Always provide the registry through context so every chapter renders with
  // a known renderer, whether a custom registry was supplied or the default.
  return (
    <VerseRenderProvider registry={resolvedRegistry}>{body}</VerseRenderProvider>
  );
}

// ---------------------------------------------------------------------------
// Per-verse composition
// ---------------------------------------------------------------------------

interface ChapterVerseProps {
  item: ParsedChapter["verses"][number];
  books: Book[];
  selected: boolean;
  highlight?: HighlightColor;
  active: boolean;
  onSelect?: (verseId: string) => void;
  onCopy?: (verseId: string) => void;
  onHighlight?: (verseId: string) => void;
  onNote?: (verseId: string) => void;
  onShare?: (verseId: string) => void;
  onBookmark?: (verseId: string) => void;
  onOpenCommentary?: (entry: CommentaryEntry) => void;
  onOpenCrossReference?: (reference: CrossReference) => void;
}

function ChapterVerse({
  item,
  books,
  selected,
  highlight,
  active,
  onSelect,
  onCopy,
  onHighlight,
  onNote,
  onShare,
  onBookmark,
  onOpenCommentary,
  onOpenCrossReference,
}: ChapterVerseProps) {
  const { verse, tree, titles, commentary, crossReferences } = item;

  const hasActions =
    Boolean(onCopy || onHighlight || onNote || onShare || onBookmark);

  return (
    <div
      data-chapter-verse
      data-active={active ? "true" : undefined}
      className={cn(active && "rounded-lg ring-1 ring-ring/60")}
    >
      {titles.length > 0 ? <VerseTitles titles={titles} /> : null}

      <VerseContainer
        tree={tree}
        verseId={verse.uuid}
        highlight={highlight}
        selected={selected}
        onSelect={onSelect ? () => onSelect(verse.uuid) : undefined}
        actions={
          hasActions ? (
            <div className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              <VerseActions
                onCopy={onCopy ? () => onCopy(verse.uuid) : undefined}
                onHighlight={onHighlight ? () => onHighlight(verse.uuid) : undefined}
                onNote={onNote ? () => onNote(verse.uuid) : undefined}
                onShare={onShare ? () => onShare(verse.uuid) : undefined}
                onBookmark={onBookmark ? () => onBookmark(verse.uuid) : undefined}
              />
            </div>
          ) : undefined
        }
        overlay={
          selected ? (
            <VerseSelectionOverlay
              open
              onCopy={onCopy ? () => onCopy(verse.uuid) : undefined}
              onHighlight={onHighlight ? () => onHighlight(verse.uuid) : undefined}
              onNote={onNote ? () => onNote(verse.uuid) : undefined}
              onShare={onShare ? () => onShare(verse.uuid) : undefined}
              onClose={onSelect ? () => onSelect(verse.uuid) : undefined}
            />
          ) : undefined
        }
      />

      {commentary.length > 0 ? (
        <VerseCommentaryList
          items={commentary}
          onOpenCommentary={onOpenCommentary}
        />
      ) : null}

      {crossReferences.length > 0 ? (
        <VerseCrossReferenceList
          references={crossReferences}
          books={books}
          onOpenCrossReference={onOpenCrossReference}
        />
      ) : null}
    </div>
  );
}

/** Section titles anchored to a verse (port of `TitleParser` row above `FullVerParse`). */
function VerseTitles({ titles }: { titles: TitleRenderTree[] }) {
  const { renderBlock } = useVerseRender();
  return (
    <div className="mb-2 space-y-1">
      {titles.map((title, index) => (
        <h2
          key={index}
          className="text-lg font-semibold text-primary"
          data-segment="title"
        >
          {title.blocks.map((block, i) => (
            <div key={i}>{renderBlock(block)}</div>
          ))}
        </h2>
      ))}
    </div>
  );
}

/** Commentary entries anchored to a verse (port of `CmtParser` container). */
function VerseCommentaryList({
  items,
  onOpenCommentary,
}: {
  items: ParsedChapterCommentary[];
  onOpenCommentary?: (entry: CommentaryEntry) => void;
}) {
  const { renderBlock } = useVerseRender();
  return (
    <div className="mt-2 space-y-2 rounded-lg border border-border/60 bg-muted/40 p-3">
      {items.map(({ entry, parsed }, index) => {
        const hasMarker =
          parsed.marker !== undefined && parsed.marker !== null;
        const blocks = parsed.blocks.map((block, i) => (
          <div key={i}>{renderBlock(block)}</div>
        ));
        return (
          <div
            key={index}
            data-segment="commentary"
            className={cn("flex items-start gap-2 text-sm text-muted-foreground", !hasMarker && "flex-col")}
          >
            {hasMarker ? (
              <VerseCommentaryMarker
                marker={parsed.marker}
                onOpen={
                  onOpenCommentary ? () => onOpenCommentary(entry) : undefined
                }
              />
            ) : null}
            <div className="min-w-0 flex-1 space-y-1">{blocks}</div>
          </div>
        );
      })}
    </div>
  );
}

/** Cross-reference chips anchored to a verse (port of `RefParses`). */
function VerseCrossReferenceList({
  references,
  books,
  onOpenCrossReference,
}: {
  references: CrossReference[];
  books: Book[];
  onOpenCrossReference?: (reference: CrossReference) => void;
}) {
  const labels = formatCrossReferences(references, books);
  return (
    <div
      className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm"
      role="list"
      aria-label="Cross references"
    >
      {references.map((reference, index) => {
        const node: ReferenceLinkNode = {
          type: "reference-link",
          target: {
            bookNumber: reference.bookTo,
            chapter: reference.chapterTo,
            verse: reference.verseToStart ?? reference.verseToEnd ?? 1,
          },
          label: labels[index],
        };
        return (
          <span key={index} role="listitem">
            <VerseReferenceChip
              node={node}
              onOpen={
                onOpenCrossReference
                  ? () => onOpenCrossReference(reference)
                  : undefined
              }
            />
          </span>
        );
      })}
    </div>
  );
}
