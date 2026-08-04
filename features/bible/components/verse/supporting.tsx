"use client";

import type {
  EmphasisNode,
  FootnoteMarkerNode,
  SuperscriptNode,
  StrongsNode,
  WordsOfJesusNode,
} from "@features/bible/parsers";
import { cn } from "@/utils/cn";
import { renderInlineChildren, useVerseRender } from "../context";

/**
 * Supporting inline renderers for node types not covered by a named public
 * component. Registered in `../registry.tsx` so the engine's tree can render
 * completely; they are internal building blocks, not part of the public
 * component list.
 */

/** Bold / italic run — `<e>`, `<b>`, `<strong>`, `<i>`, `<em>`. */
export function VerseEmphasis({
  node,
  className,
}: {
  node: EmphasisNode;
  className?: string;
}) {
  const { renderInline } = useVerseRender();
  const Tag = node.variant === "italic" ? "em" : "strong";
  return (
    <Tag
      data-segment="emphasis"
      className={cn(node.variant === "italic" ? "italic" : "font-semibold", className)}
    >
      {renderInlineChildren(node.children, renderInline)}
    </Tag>
  );
}

/** Words of Jesus — `<j>` (red letters). */
export function VerseWordsOfJesus({
  node,
  className,
}: {
  node: WordsOfJesusNode;
  className?: string;
}) {
  const { renderInline } = useVerseRender();
  return (
    <span
      data-segment="words-of-jesus"
      className={cn("text-red-600 dark:text-red-400", className)}
    >
      {renderInlineChildren(node.children, renderInline)}
    </span>
  );
}

/** Superscript run — `<sup>`. */
export function VerseSuperscript({
  node,
  className,
}: {
  node: SuperscriptNode;
  className?: string;
}) {
  const { renderInline } = useVerseRender();
  return (
    <sup data-segment="superscript" className={cn(className)}>
      {renderInlineChildren(node.children, renderInline)}
    </sup>
  );
}

/** Strong's number — future `<w>`/`<s>`. */
export function VerseStrongs({
  node,
  className,
}: {
  node: StrongsNode;
  className?: string;
}) {
  const { renderInline } = useVerseRender();
  return (
    <span
      data-segment="strongs"
      data-strongs={node.number}
      className={cn("align-super text-[10px] text-muted-foreground", className)}
    >
      {node.number}
      {renderInlineChildren(node.children, renderInline)}
    </span>
  );
}

/** Footnote marker — future `<fn>`/`<f>`. */
export function VerseFootnoteMarker({
  node,
  className,
}: {
  node: FootnoteMarkerNode;
  className?: string;
}) {
  return (
    <sup
      data-segment="footnote-marker"
      data-footnote-id={node.id}
      className={cn("text-primary", className)}
    >
      †
    </sup>
  );
}
