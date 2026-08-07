"use client";

import { memo, useMemo } from "react";
import { BookOpen } from "lucide-react";
import { cn } from "@/utils/cn";
import { parseVerse } from "../../parsers";
import { VerseContainer } from "../../components/verse/verse-container";
import { toNepaliDigits } from "../../utils/nepali-numbers";
import type { SearchResult } from "../../types";

export interface SearchResultCardProps {
  /** The search hit (verse + version + book + snippet). */
  result: SearchResult;
  /** Query used for the in-verse search highlighting (parser `searchQuery`). */
  query: string;
  /** Show Jesus' words in red (reader setting). */
  redLetters?: boolean;
  /** Show verse numbers (reader setting). */
  showVerseNumbers?: boolean;
  /** Whether this verse is part of the active selection. */
  selected: boolean;
  /** Keyboard-navigation focus ring. */
  active?: boolean;
  /** Opens the verse in the reader (reuses ChapterViewer via navigation). */
  onOpen?: () => void;
  // ---- interaction handlers (delegated from `useVerseInteraction`) ----
  onPointerDown?: (event: React.PointerEvent) => void;
  onPointerUp?: (event: React.PointerEvent) => void;
  onPointerMove?: (event: React.PointerEvent) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onContextMenu?: (event: React.MouseEvent) => void;
  className?: string;
}

/**
 * SearchResultCard — one search hit.
 *
 * RENDERING IS NOT DUPLICATED: the verse body reuses `parseVerse` (Verse
 * Rendering Engine) + `VerseContainer` + the shared renderer registry, so
 * search results automatically preserve parsing, cross-ref/commentary
 * markers, and `search-highlight` (`<mark>`) rendering. Selection, copy,
 * share, context menu and Shift+click range all flow through the Verse
 * Interaction System — the handlers are passed in by the results list.
 */
export const SearchResultCard = memo(function SearchResultCard({
  result,
  query,
  redLetters = true,
  showVerseNumbers = true,
  selected,
  active,
  onOpen,
  onPointerDown,
  onPointerUp,
  onPointerMove,
  onKeyDown,
  onContextMenu,
  className,
}: SearchResultCardProps) {
  const { verse: source, version, book } = result;
  const language = version.language ?? "ne";

  // Parse with the search query (matches render as `<mark>`) plus the reader
  // display settings (red letters + verse numbers) — consistent with the
  // reader, no duplicated engine/rendering logic.
  const tree = useMemo(
    () =>
      parseVerse(source, language, {
        searchQuery: query,
        redLetters,
        verseNumber: showVerseNumbers,
      }),
    [source, language, query, redLetters, showVerseNumbers],
  );

  const reference = `${book.longName} ${toNepaliDigits(source.chapter)}:${toNepaliDigits(source.verse)}`;

  return (
    <article
      data-search-result
      data-active={active || undefined}
      className={cn(
        "rounded-xl border bg-card p-3 shadow-sm transition-colors",
        active && "ring-2 ring-primary/40",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex min-w-0 items-center gap-1.5 text-sm font-semibold text-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          <BookOpen className="size-4 shrink-0 text-primary" aria-hidden />
          <span className="truncate">{reference}</span>
        </button>
        <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {version.shortCode}
        </span>
      </div>
      <VerseContainer
        tree={tree}
        verseId={source.uuid}
        selected={selected}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerMove={onPointerMove}
        onKeyDown={onKeyDown}
        onContextMenu={onContextMenu}
      />
    </article>
  );
});
