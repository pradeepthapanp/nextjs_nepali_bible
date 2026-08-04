"use client";

import type { ReferenceLinkNode } from "@features/bible/parsers";
import { cn } from "@/utils/cn";

export interface VerseReferenceChipProps {
  /** The parsed `reference-link` node (e.g. a commentary `<reflink>`). */
  node: ReferenceLinkNode;
  /** Opens the referenced passage when provided. */
  onOpen?: (node: ReferenceLinkNode) => void;
  className?: string;
}

/**
 * VerseReferenceChip — renders a cross-reference / commentary link.
 *
 * Replaces the `<reflink>` handling in Flutter's `CmtParser` (a tappable,
 * underlined reference that opened the reference sheet). Renders the label as
 * a link-style button; opening is delegated via `onOpen`, so the component
 * stays presentational.
 */
export function VerseReferenceChip({
  node,
  onOpen,
  className,
}: VerseReferenceChipProps) {
  return (
    <button
      type="button"
      data-segment="reference-link"
      onClick={onOpen ? () => onOpen(node) : undefined}
      disabled={!onOpen}
      className={cn(
        "inline text-primary underline underline-offset-4 transition-opacity hover:opacity-80",
        !onOpen && "cursor-default",
        className,
      )}
    >
      {node.label}
    </button>
  );
}
