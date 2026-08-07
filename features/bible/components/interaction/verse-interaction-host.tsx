"use client";

import { useVerseInteractionHost } from "../../hooks/use-verse-interaction-host";
import { HighlightPalette } from "./highlight-palette";
import { VerseContextMenu } from "./verse-context-menu";
import { VerseSelectionOverlay } from "./verse-selection-overlay";

/**
 * VerseInteractionHost — the single mount point for the Verse Interaction
 * System's global UI and behaviors.
 *
 * Rendered once by the reader wiring (future). It:
 *   - mounts `useVerseInteractionHost` (ESC, Back-clears-selection, native
 *     text-selection clearing), and
 *   - renders the selection overlay (bottom bar) and the context menu.
 *
 * It is fully independent from BibleHome / React Query / Supabase / the
 * parser; importing it also registers the built-in plugin actions.
 */

export interface VerseInteractionHostProps {
  className?: string;
}

export function VerseInteractionHost({ className }: VerseInteractionHostProps) {
  useVerseInteractionHost();
  return (
    <>
      <VerseSelectionOverlay className={className} />
      <VerseContextMenu />
      <HighlightPalette />
    </>
  );
}
