"use client";

import type { PoetryNode } from "@features/bible/parsers";
import { cn } from "@/utils/cn";
import { renderInlineChildren, useVerseRender } from "../context";

export interface VersePoetryProps {
  /** The parsed `poetry` block from the rendering engine. */
  block: PoetryNode;
  className?: string;
}

/**
 * VersePoetry — renders a poetry block as indented lines.
 *
 * Flutter had no dedicated poetry widget; this is a web-first block renderer
 * for the engine's `poetry` node. Each line is a semantic `<p>` with a left
 * indent, matching common Bible poetry layout.
 */
export function VersePoetry({ block, className }: VersePoetryProps) {
  const { renderInline } = useVerseRender();
  return (
    <div
      data-block="poetry"
      className={cn("space-y-1", className)}
      style={{ marginBottom: "var(--reader-paragraph-spacing)" }}
    >
      {block.lines.map((line, index) => (
        <p key={index} className="ps-6 text-pretty">
          {renderInlineChildren(line, renderInline)}
        </p>
      ))}
    </div>
  );
}
