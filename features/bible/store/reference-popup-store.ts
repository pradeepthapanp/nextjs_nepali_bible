"use client";

import { create } from "zustand";
import type { Reference, VerseRange } from "../types";

/**
 * Reference popup UI state — a transient "hover/popup" showing the verses a
 * reflink / cross-reference points to, WITHOUT leaving the current chapter.
 *
 * Replaces the separate-page navigation that `goTo` did for commentary
 * reflinks, cross-reference chips and inline reference links. Three opening
 * modes map to the three link kinds:
 *   - `reference`: a single `<reflink target="Luk 4:26">` / `<a href="B:…">`
 *   - `crossReference`: a chapter cross-reference (target book/chapter/verse
 *     range from the `cross_references` table)
 *   - `commentary`: a commentary entry (opens its anchored verse)
 *
 * UI state only — the verses themselves are fetched by `useVerseRange`
 * (React Query) keyed off the stored `reference`.
 */

export type ReferencePopupKind = "reference" | "crossReference" | "commentary";

export interface ReferencePopupState {
  /** Whether the popup is visible. */
  open: boolean;
  /** Which kind of link opened it (drives the header/title). */
  kind: ReferencePopupKind | null;
  /** The target passage (a verse or verse range). */
  reference: Reference | null;
  /** Optional cross-reference row (keeps source→target context). */
  crossReference?: {
    sourceLabel: string;
    targetLabel: string;
    /** Inclusive target verse range start/end (when known). */
    verseToStart?: number;
    verseToEnd?: number;
  };
  /** Optional commentary entry marker/title. */
  commentaryMarker?: string | number;

  openReference: (reference: Reference) => void;
  openCrossReference: (reference: Reference, opts: {
    sourceLabel: string;
    targetLabel: string;
    verseToStart?: number;
    verseToEnd?: number;
  }) => void;
  openCommentary: (reference: Reference, marker?: string | number) => void;
  close: () => void;
}

export const useReferencePopupStore = create<ReferencePopupState>()((set) => ({
  open: false,
  kind: null,
  reference: null,

  openReference: (reference) =>
    set({ open: true, kind: "reference", reference, crossReference: undefined }),

  openCrossReference: (reference, opts) =>
    set({
      open: true,
      kind: "crossReference",
      reference,
      crossReference: {
        sourceLabel: opts.sourceLabel,
        targetLabel: opts.targetLabel,
        // `0` is the database's "no end" sentinel — normalize to undefined.
        verseToStart: opts.verseToStart && opts.verseToStart > 0 ? opts.verseToStart : undefined,
        verseToEnd: opts.verseToEnd && opts.verseToEnd > 0 ? opts.verseToEnd : undefined,
      },
    }),

  openCommentary: (reference, marker) =>
    set({
      open: true,
      kind: "commentary",
      reference,
      commentaryMarker: marker,
    }),

  close: () => set({ open: false }),
}));
