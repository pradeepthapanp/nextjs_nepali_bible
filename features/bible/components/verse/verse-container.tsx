"use client";

import type { VerseRenderTree } from "@features/bible/parsers";
import type { HighlightColor } from "@features/bible/types";
import { HIGHLIGHT_COLORS } from "@features/bible/constants";
import { cn } from "@/utils/cn";
import { useVerseRender } from "../context";

export interface VerseContainerProps {
  /** The parsed verse render tree (blocks + verse). */
  tree: VerseRenderTree;
  /** Verse row uuid — used for the anchor id and data attribute. */
  verseId?: string;
  /** Whole-verse background highlight (future; distinct from inline). */
  highlight?: HighlightColor;
  /** Mark the verse as selected (drives the selection overlay). */
  selected?: boolean;
  onSelect?: () => void;
  /** Rendered below the verse blocks (e.g. `<VerseActions>`). */
  actions?: React.ReactNode;
  /** Rendered above the verse blocks (e.g. `<VerseSelectionOverlay>`). */
  overlay?: React.ReactNode;
  className?: string;
}

/**
 * VerseContainer — the per-verse wrapper: layout of the parsed blocks plus
 * optional whole-verse highlight, selection overlay and actions.
 *
 * Replaces Flutter's `FullVerParse` (which composed `NepParser` +
 * `CmtParser` + `RefParses` under one verse). It receives the parsed
 * `VerseRenderTree` and renders each block through the active renderer
 * registry; highlights/notes/commentary/cross-refs are wired via props, so
 * future features need no changes here.
 */
export function VerseContainer({
  tree,
  verseId,
  highlight,
  selected,
  onSelect,
  actions,
  overlay,
  className,
}: VerseContainerProps) {
  const { renderBlock } = useVerseRender();

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!onSelect) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <article
      id={verseId ? `verse-${verseId}` : undefined}
      data-verse-id={verseId}
      data-selected={selected ? "true" : undefined}
      className={cn(
        "group relative",
        highlight && HIGHLIGHT_COLORS[highlight].className,
        className,
      )}
    >
      {overlay}
      <div
        onClick={onSelect}
        onKeyDown={handleKeyDown}
        role={onSelect ? "button" : undefined}
        tabIndex={onSelect ? 0 : undefined}
        aria-label={onSelect ? "Select verse" : undefined}
      >
        {tree.blocks.map((block, index) => (
          <div key={index}>{renderBlock(block)}</div>
        ))}
      </div>
      {actions}
    </article>
  );
}
