"use client";

import { Highlighter } from "lucide-react";
import { registerVerseAction } from "../../../store/verse-action-registry";
import { useHighlightStore } from "../../../store/highlight-store";
import type { VerseAction } from "../../../types";

/**
 * Highlight verse action — a Verse Interaction System plugin.
 *
 * Registers itself in the action registry (NOT hardcoded in the toolbar), so
 * the toolbar and context menu discover it automatically, exactly like Copy /
 * Copy-reference / Share. Running it opens the highlight palette
 * (`HighlightPalette`), which acts on the current selection. The selection is
 * deliberately kept (highlighting is iterative: pick a colour, clear, undo),
 * unlike copy/share which clear on success.
 *
 * Ports the Flutter SelectionBar's "Highlight" section
 * (`lib/bible/widgets/bottom_app_bar.dart`), which opened the colour palette
 * from the selection bar.
 */

export const highlightAction: VerseAction = {
  id: "highlight",
  label: "Highlight",
  icon: Highlighter,
  order: 15,
  placement: "both",
  description: "Highlight the selected verses with a colour",
  canRun: ({ selection }) => selection.verses.length > 0,
  run: ({ selection }) => {
    if (selection.verses.length === 0) return;
    useHighlightStore.getState().openPalette();
  },
};

/** Registers the highlight action (idempotent via the built-in registrar). */
export function registerHighlightActions(): void {
  registerVerseAction(highlightAction);
}
