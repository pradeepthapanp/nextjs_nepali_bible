"use client";

import type { LyricsRenderTree } from "@features/music/parsers";
import { useMemo } from "react";
import { cn } from "@/utils/cn";
import { LyricsRenderProvider } from "../context/lyrics-render-context";
import { createLyricsRendererRegistry } from "../registry/lyrics-registry";
import { LyricsView } from "../lyrics/lyrics-view";
import { SongHeader } from "./song-header";

export interface SongReaderProps {
  /** An already-parsed lyrics render tree — NEVER parsed here. */
  tree: LyricsRenderTree;
  /** Show/hide chord text (default true); applied via the render registry. */
  showChords?: boolean;
  /** Tap a rendered chord (e.g. open the chord chart sheet). */
  onChordTap?: (chord: string) => void;
  className?: string;
}

/**
 * SongReader — the lyrics+chords surface (the web equivalent of
 * `custom_chords_widget.dart`): the `SongHeader` (title + key/beat chips) and
 * the `LyricsView` body. Receives an already-parsed `LyricsRenderTree` and
 * NEVER parses lyrics; it only composes presentational components and provides
 * the render registry (chord visibility + chord-tap) via `LyricsRenderProvider`.
 */
export function SongReader({
  tree,
  showChords = true,
  onChordTap,
  className,
}: SongReaderProps) {
  const registry = useMemo(
    () => createLyricsRendererRegistry({ showChords, onChordTap }),
    [showChords, onChordTap],
  );
  return (
    <LyricsRenderProvider registry={registry}>
      <div className={cn("space-y-4", className)}>
        <SongHeader tree={tree} onChordTap={onChordTap} />
        <LyricsView tree={tree} />
      </div>
    </LyricsRenderProvider>
  );
}
