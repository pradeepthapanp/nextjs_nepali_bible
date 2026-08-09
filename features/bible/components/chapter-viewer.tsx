"use client";

import { useEffect, useMemo } from "react";
import { cn } from "@/utils/cn";
import { useVerseInteraction } from "../hooks";
import {
  formatCrossReferences,
  parseChapterContent,
  parseVerse,
  type ParsedChapter,
  type ParsedChapterCommentary,
  type ReferenceLinkNode,
  type RendererRegistry,
  type TitleRenderTree,
  type VerseParseOptions,
  type VerseRenderTree,
} from "@features/bible/parsers";
import type {
  Book,
  BibleVersion,
  ChapterContent,
  CommentaryEntry,
  CrossReference,
  Reference,
  SelectedVerse,
  Verse,
} from "@features/bible/types";
import { toNepaliDigits } from "@features/bible/utils";
import { ChapterContainer } from "./chapter/chapter-container";
import { ChapterFooter } from "./chapter/chapter-footer";
import { ChapterHeader } from "./chapter/chapter-header";
import { VerseRenderProvider, useVerseRender } from "./context";
import { createVerseRendererRegistry } from "./registry";
import {
  VerseCommentaryMarker,
  VerseContainer,
  VerseReferenceChip,
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
 *   - Compose: `ChapterHeader`, per-verse `VerseContainer` (+ titles,
 *     commentary markers/blocks, cross-ref chips), and `ChapterFooter`.
 *   - Delegate EVERY verse interaction (tap, Ctrl/Cmd, Shift, keyboard,
 *     long-press, right-click) to `useVerseInteraction()`. `VerseContainer`
 *     stays presentational and owns no interaction state.
 *
 * The selection toolbar / overlay are rendered once by `<VerseInteractionHost>`
 * (mounted in BibleHome), so this component contains no overlay or action UI.
 * It does NOT fetch data, call Supabase, or call React Query.
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
  /** English NIV parallel verses for this chapter (the "English Verses" toggle).
   * Parsed with the same engine and rendered under each matching Nepali verse. */
  englishVerses?: Verse[];
  /** Pre-computed parser output; when omitted it is derived from `content`. */
  parsed?: ParsedChapter;
  /** Custom renderer registry; defaults to the standard verse registry. */
  registry?: RendererRegistry<React.ReactNode>;
  /** Verse id being read aloud (audio sync) — drives the active ring. */
  activeVerseId?: string;
  /** Opens the commentary anchored at this verse's marker. */
  onOpenCommentary?: (entry: CommentaryEntry) => void;
  /** Opens the reference sheet for a cross-reference chip. */
  onOpenCrossReference?: (reference: CrossReference) => void;
  /** Opens the passage a parsed reference points to (inline reflinks / cross-ref markers). */
  onOpenReference?: (reference: Reference) => void;
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
  englishVerses,
  parsed,
  registry,
  activeVerseId,
  onOpenCommentary,
  onOpenCrossReference,
  onOpenReference,
  onPreviousChapter,
  onNextChapter,
  canGoPrevious,
  canGoNext,
  className,
}: ChapterViewerProps) {
  // Verse Interaction System — every interaction is delegated here.
  const {
    selection,
    setChapterOrder,
    onVersePointerDown,
    onVersePointerUp,
    onVersePointerMove,
    onVerseKeyDown,
    onVerseContextMenu,
  } = useVerseInteraction();

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
  // The fallback registry wires inline reflinks / cross-ref markers to
  // `onOpenReference` so they navigate to the referenced passage.
  const resolvedRegistry = useMemo(
    () =>
      registry ??
      createVerseRendererRegistry({
        onOpenReference: onOpenReference
          ? (target) => {
              if (target) onOpenReference(target);
            }
          : undefined,
      }),
    [registry, onOpenReference],
  );

  const bookName = useMemo(
    () =>
      books?.find((book) => book.bookNumber === content.bookNumber)?.longName ??
      String(content.bookNumber),
    [books, content.bookNumber],
  );

  // English NIV parallel verses — parsed with the SAME verse engine as Nepali
  // (language "en" → Arabic numbers; verse number hidden since the Nepali
  // verse already shows it; red letters follow the reader setting). Keyed by
  // verse number so a missing English verse simply renders nothing.
  const englishTrees = useMemo(() => {
    const map = new Map<number, VerseRenderTree>();
    for (const verse of englishVerses ?? []) {
      map.set(
        verse.verse,
        parseVerse(verse, "en", {
          verseNumber: false,
          redLetters: parseOptions?.redLetters,
        }),
      );
    }
    return map;
  }, [englishVerses, parseOptions?.redLetters]);

  // SelectedVerse snapshots (data-layer-independent) + the chapter order used
  // for Shift+click range extension.
  const selectedVerses = useMemo<SelectedVerse[]>(
    () =>
      chapter.verses.map((item) => ({
        id: item.verse.uuid,
        bookNumber: item.verse.bookNumber,
        chapter: item.verse.chapter,
        verse: item.verse.verse,
        text: item.verse.text,
        bookName,
      })),
    [chapter, bookName],
  );

  const selectedVerseById = useMemo(
    () => new Map(selectedVerses.map((verse) => [verse.id, verse])),
    [selectedVerses],
  );

  const selectedIds = useMemo(
    () => new Set(selection.verses.map((verse) => verse.id)),
    [selection.verses],
  );

  // Keep the interaction system's chapter order in sync (Shift+click ranges).
  useEffect(() => {
    setChapterOrder(selectedVerses);
  }, [setChapterOrder, selectedVerses]);

  const body = (
    <ChapterContainer dataVersionId={version.id} className={className}>
      <ChapterHeader bookName={bookName} chapterNumber={content.chapter} />

      {chapter.verses.map((item) => (
        <ChapterVerse
          key={item.verse.uuid}
          item={item}
          books={books ?? []}
          englishTree={englishTrees.get(item.verse.verse)}
          active={activeVerseId === item.verse.uuid}
          selected={selectedIds.has(item.verse.uuid)}
          selectedVerse={selectedVerseById.get(item.verse.uuid)}
          onPointerDown={onVersePointerDown}
          onPointerUp={onVersePointerUp}
          onPointerMove={onVersePointerMove}
          onKeyDown={onVerseKeyDown}
          onContextMenu={onVerseContextMenu}
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
  /** Parsed English NIV verse for this verse number (undefined → omit). */
  englishTree?: VerseRenderTree;
  selected: boolean;
  active: boolean;
  selectedVerse?: SelectedVerse;
  onPointerDown?: (verse: SelectedVerse, event: React.PointerEvent) => void;
  onPointerUp?: (verse: SelectedVerse, event: React.PointerEvent) => void;
  onPointerMove?: (verse: SelectedVerse, event: React.PointerEvent) => void;
  onKeyDown?: (verse: SelectedVerse, event: React.KeyboardEvent) => void;
  onContextMenu?: (verse: SelectedVerse, event: React.MouseEvent) => void;
  onOpenCommentary?: (entry: CommentaryEntry) => void;
  onOpenCrossReference?: (reference: CrossReference) => void;
}

function ChapterVerse({
  item,
  books,
  englishTree,
  selected,
  active,
  selectedVerse,
  onPointerDown,
  onPointerUp,
  onPointerMove,
  onKeyDown,
  onContextMenu,
  onOpenCommentary,
  onOpenCrossReference,
}: ChapterVerseProps) {
  const { verse, tree, titles, commentary, crossReferences } = item;
  const { renderBlock } = useVerseRender();

  // Wrapped interaction handlers — shared by the Nepali verse AND the English
  // block so clicking either translation selects the SAME verse (both remain
  // associated with one selection/highlight/copy/notes unit).
  const pointerDown =
    selectedVerse && onPointerDown
      ? (event: React.PointerEvent) => onPointerDown(selectedVerse, event)
      : undefined;
  const pointerUp =
    selectedVerse && onPointerUp
      ? (event: React.PointerEvent) => onPointerUp(selectedVerse, event)
      : undefined;
  const pointerMove =
    selectedVerse && onPointerMove
      ? (event: React.PointerEvent) => onPointerMove(selectedVerse, event)
      : undefined;
  const keyDown =
    selectedVerse && onKeyDown
      ? (event: React.KeyboardEvent) => onKeyDown(selectedVerse, event)
      : undefined;
  const contextMenu =
    selectedVerse && onContextMenu
      ? (event: React.MouseEvent) => onContextMenu(selectedVerse, event)
      : undefined;

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
        selected={selected}
        onPointerDown={pointerDown}
        onPointerUp={pointerUp}
        onPointerMove={pointerMove}
        onKeyDown={keyDown}
        onContextMenu={contextMenu}
      />

      {/* English NIV parallel verse — rendered under the Nepali verse with the
          same engine; visually secondary (smaller + muted), inherits the reader
          font size / line height / alignment / theme. Omitted when the English
          verse for this number does not exist. */}
      {englishTree ? (
        <div
          data-english-verse
          onPointerDown={pointerDown}
          onPointerUp={pointerUp}
          onPointerMove={pointerMove}
          onContextMenu={contextMenu}
          className={cn(
            "mt-2 rounded-lg border-l-2 border-border/50 pl-3 text-[0.92em] text-muted-foreground",
            selected && "bg-primary/5 ring-1 ring-primary/20",
          )}
        >
          <span
            data-segment="english-label"
            className="mb-0.5 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60"
          >
            NIV
          </span>
          {englishTree.blocks.map((block, index) => (
            <div key={index}>{renderBlock(block)}</div>
          ))}
        </div>
      ) : null}

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
            className={cn(
              "flex items-start gap-2 text-muted-foreground",
              !hasMarker && "flex-col",
            )}
          >
            {hasMarker ? (
              <VerseCommentaryMarker
                marker={parsed.marker}
                onOpen={
                  onOpenCommentary ? () => onOpenCommentary(entry) : undefined
                }
              />
            ) : null}
            {/* Commentary text tracks the verse font size (2px smaller) via
                the `--reader-font-size` var set by the reader on <main>. */}
            <div
              className="min-w-0 flex-1 space-y-1"
              style={{ fontSize: "calc(var(--reader-font-size, 17px) - 2px)" }}
            >
              {blocks}
            </div>
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
