"use client";

import type { ReactNode } from "react";
import type { LyricsInlineNode } from "@features/music/parsers";
import { ChordText } from "../lyrics/chord-text";

/**
 * Lyrics renderer registry — the single node type → component mapping for
 * the Music feature (the counterpart to the Bible module's
 * `createVerseRendererRegistry`).
 *
 * Centralizing the mapping here means `LyricsView`/`LyricsLine` never
 * duplicate "how an inline node renders". `showChords` and `onChordTap` are
 * injected via options so chord visibility and chord-chart taps are a render
 * concern (the tree itself always carries the chord segments).
 */

export interface LyricsRendererRegistry {
  renderInline(node: LyricsInlineNode): ReactNode;
}

export interface LyricsRendererRegistryOptions {
  /** Render chord text above the lyric (default true). */
  showChords?: boolean;
  /** Tap a rendered chord (e.g. open the chord chart sheet). */
  onChordTap?: (chord: string) => void;
}

/** Builds the registry mapping text/chord inline nodes to components. */
export function createLyricsRendererRegistry(
  options: LyricsRendererRegistryOptions = {},
): LyricsRendererRegistry {
  const { showChords = true, onChordTap } = options;
  return {
    renderInline: (node) => {
      if (node.type === "chord") {
        return showChords ? (
          <ChordText
            chord={node.chord}
            lyric={node.lyric}
            onChordTap={onChordTap}
          />
        ) : (
          <span>{node.lyric}</span>
        );
      }
      return <span>{node.text}</span>;
    },
  };
}
