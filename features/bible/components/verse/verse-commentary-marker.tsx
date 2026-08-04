"use client";

import { cn } from "@/utils/cn";

export interface VerseCommentaryMarkerProps {
  /** The commentary marker chip (from `CommentaryRenderTree.marker`). */
  marker?: string | number;
  /** Opens the commentary for the anchor when provided. */
  onOpen?: () => void;
  className?: string;
}

/**
 * VerseCommentaryMarker — renders the commentary anchor chip.
 *
 * Replaces the marker handling around Flutter's `CmtParser` (which rendered
 * each commentary entry inline under the verse). It receives the marker value
 * from the parsed `CommentaryRenderTree` and stays presentational — opening is
 * delegated via `onOpen`.
 */
export function VerseCommentaryMarker({
  marker,
  onOpen,
  className,
}: VerseCommentaryMarkerProps) {
  if (marker === undefined || marker === null) return null;

  const inner = (
    <span
      data-segment="commentary-marker"
      className={cn(
        "me-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 align-super text-[10px] font-semibold text-primary",
        className,
      )}
    >
      {marker}
    </span>
  );

  if (onOpen) {
    return (
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open commentary for marker ${String(marker)}`}
        className="align-baseline rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {inner}
      </button>
    );
  }

  return inner;
}
