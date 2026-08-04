"use client";

import type { CrossReferenceMarkerNode } from "@features/bible/parsers";
import { cn } from "@/utils/cn";

export interface VerseCrossReferenceMarkerProps {
  /** The parsed `cross-reference-marker` node. */
  node: CrossReferenceMarkerNode;
  /** Opens the reference sheet when provided. */
  onOpen?: (node: CrossReferenceMarkerNode) => void;
  className?: string;
}

/**
 * VerseCrossReferenceMarker — renders a superscript cross-reference marker.
 *
 * Replaces the superscript reference markers that Flutter's `RefParse`
 * rendered as tappable chips (`<shortName> <chapter>:<verse>`). Renders the
 * marker label as a small superscript button when `onOpen` is provided, so
 * the reader can open the reference without this component fetching anything.
 */
export function VerseCrossReferenceMarker({
  node,
  onOpen,
  className,
}: VerseCrossReferenceMarkerProps) {
  return (
    <button
      type="button"
      data-segment="cross-reference-marker"
      onClick={onOpen ? () => onOpen(node) : undefined}
      aria-label={`Cross reference ${node.label}`}
      disabled={!onOpen}
      className={cn(
        "mx-0.5 inline-flex cursor-pointer items-center align-super text-[10px] font-semibold leading-none text-primary",
        !onOpen && "cursor-default",
        className,
      )}
    >
      {node.label}
    </button>
  );
}
