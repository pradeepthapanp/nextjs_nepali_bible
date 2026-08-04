"use client";

import type { VerseNumberNode } from "@features/bible/parsers";
import { cn } from "@/utils/cn";

export interface VerseNumberProps {
  /** The parsed `verse-number` node (Nepali digits for `ne`, Arabic for `en`). */
  node: VerseNumberNode;
  className?: string;
}

/**
 * VerseNumber — renders the verse's leading number.
 *
 * Replaces the `<nv>`/`<ev>` prefix in Flutter's `NepParse`/`EngParse`
 * (styled with the disabled colour there). The number is kept in the
 * accessibility tree so screen readers announce it.
 */
export function VerseNumber({ node, className }: VerseNumberProps) {
  return (
    <span
      data-segment="verse-number"
      className={cn(
        "me-1 select-none font-semibold text-muted-foreground",
        className,
      )}
    >
      {node.text}
    </span>
  );
}
