import type { LucideIcon } from "lucide-react";

/**
 * Verse Interaction System — domain types.
 *
 * The interaction layer is deliberately data-layer-independent: it works with
 * `SelectedVerse` snapshots (id + reference + text) rather than the full
 * `Verse` model, so it never needs React Query, Supabase or the parser. The
 * reader wiring (future) constructs `SelectedVerse` objects from the chapter
 * data and hands them to the store/handlers.
 */

/** How the current selection was initiated / is being extended. */
export type InteractionMode = "single" | "multi" | "keyboard" | "touch";

/** A selected verse — a minimal, data-layer-independent snapshot. */
export interface SelectedVerse {
  /** Verse row uuid (also the DOM anchor id). */
  id: string;
  bookNumber: number;
  chapter: number;
  /** Verse number (1-based). */
  verse: number;
  /** Verse text used by copy/share actions (plain text or markup). */
  text: string;
  /** Book display name for building references (falls back to bookNumber). */
  bookName?: string;
}

/** The current selection state exposed by the interaction store. */
export interface VerseSelection {
  /** Whether any verse is selected. */
  active: boolean;
  /** How selection was initiated. */
  mode: InteractionMode;
  /** Selected verses, in selection order. */
  verses: SelectedVerse[];
  /** Verse id where a range selection started. */
  anchorId?: string;
}

/** Context passed to every verse action when it runs. */
export interface VerseActionContext {
  selection: VerseSelection;
  /** Clears the current selection (and any native text selection). */
  clear: () => void;
  /** Client-side navigation (e.g. to the notes editor) — optional. */
  navigate?: (path: string) => void;
}

/** Where an action should appear. */
export type VerseActionPlacement = "toolbar" | "menu" | "both";

/**
 * A verse action plugin.
 *
 * Actions register themselves in the action registry and the toolbar / context
 * menu render whatever is registered — adding a future action (highlight,
 * notes, bookmark, compare, AI) is one new plugin + one `register` call, with
 * zero changes to the toolbar, overlay, context menu or store.
 */
export interface VerseAction {
  /** Unique action id (e.g. "copy", "share", "highlight"). */
  id: string;
  /** Accessible label shown in the UI. */
  label: string;
  /** Optional icon (lucide). */
  icon?: LucideIcon;
  /** Lower values render first. */
  order?: number;
  /** Whether it appears in the toolbar, the context menu, or both. */
  placement?: VerseActionPlacement;
  /** Optional tooltip / description. */
  description?: string;
  /** Optional availability check (e.g. require a multi-verse selection). */
  canRun?: (context: VerseActionContext) => boolean;
  /** Runs the action. */
  run: (context: VerseActionContext) => void | Promise<void>;
}
