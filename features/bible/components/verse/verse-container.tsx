"use client";

import type { VerseRenderTree } from "@features/bible/parsers";
import type { HighlightColor } from "@features/bible/types";
import { HIGHLIGHT_COLORS } from "@features/bible/constants";
import { cn } from "@/utils/cn";
import { useVerseRender } from "../context";
import { useHighlightContext } from "../highlight-provider";

export interface VerseContainerProps {
  /** The parsed verse render tree (blocks + verse). */
  tree: VerseRenderTree;
  /** Verse row uuid — used for the anchor id and data attribute. */
  verseId?: string;
  /** Whole-verse background highlight (future; distinct from inline). */
  highlight?: HighlightColor;
  /** Whether this verse is part of the active selection. */
  selected?: boolean;
  // ---- interaction (delegated from `useVerseInteraction`) ----
  /** Pointer down: tap / Shift / Ctrl+Cmd / touch long-press. */
  onPointerDown?: (event: React.PointerEvent) => void;
  /** Pointer up — cancels a pending long-press. */
  onPointerUp?: (event: React.PointerEvent) => void;
  /** Pointer move — cancels a pending long-press while scrolling. */
  onPointerMove?: (event: React.PointerEvent) => void;
  /** Keyboard selection (Enter / Space). */
  onKeyDown?: (event: React.KeyboardEvent) => void;
  /** Right-click context menu. */
  onContextMenu?: (event: React.MouseEvent) => void;
  className?: string;
}

/**
 * VerseContainer — the per-verse wrapper: layout of the parsed blocks plus the
 * selected state. It owns NO interaction state: selection is driven entirely by
 * the Verse Interaction System (`useVerseInteraction`), and the handlers are
 * passed in by the composition layer. Selection visuals are a plain `selected`
 * flag; the floating toolbar/overlay come from the interaction host.
 *
 * Replaces Flutter's `FullVerParse` (which composed `NepParser` +
 * `CmtParser` + `RefParses` under one verse, with tap-to-select baked in).
 */
export function VerseContainer({
  tree,
  verseId,
  highlight,
  selected,
  onPointerDown,
  onPointerUp,
  onPointerMove,
  onKeyDown,
  onContextMenu,
  className,
}: VerseContainerProps) {
  const { renderBlock } = useVerseRender();
  const { highlightFor } = useHighlightContext();

  // The explicit `highlight` prop wins; otherwise read the shared highlight
  // map (reader + search results both repaint without prop drilling).
  const resolvedHighlight =
    highlight ?? (verseId ? highlightFor(verseId) : undefined);

  const interactive = Boolean(onPointerDown || onKeyDown);

  return (
    <article
      id={verseId ? `verse-${verseId}` : undefined}
      data-verse-id={verseId}
      data-selected={selected ? "true" : undefined}
      data-highlighted={resolvedHighlight || undefined}
      className={cn(
        "relative rounded-lg",
        selected && "bg-primary/5 ring-1 ring-primary/20",
        // `?.` guards against legacy/unknown palette values in the database
        // (e.g. pre-web highlight rows) — an unrecognized color renders as no
        // highlight instead of crashing the verse.
        resolvedHighlight && HIGHLIGHT_COLORS[resolvedHighlight]?.className,
        className,
      )}
    >
      <div
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerMove={onPointerMove}
        onKeyDown={onKeyDown}
        onContextMenu={onContextMenu}
        tabIndex={interactive ? 0 : undefined}
        aria-label={interactive ? "Select verse" : undefined}
        className={cn(interactive && "cursor-default outline-none focus-visible:ring-2 focus-visible:ring-ring")}
      >
        {tree.blocks.map((block, index) => (
          <div key={index}>{renderBlock(block)}</div>
        ))}
      </div>
    </article>
  );
}
