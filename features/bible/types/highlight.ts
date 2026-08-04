/**
 * Verse highlight model. Mirrors the Flutter `VerseHighlight` model
 * (`lib/models/verse_highlight.dart`). The color palette is defined in
 * `constants/highlight-colors.ts`.
 */

export type HighlightColor =
  | "yellow"
  | "green"
  | "blue"
  | "pink"
  | "purple";

export interface Highlight {
  id: string;
  userId: string;
  /** The verse row UUID (Verse.uuid) this highlight applies to. */
  verseId: string;
  color: HighlightColor;
  createdAt: string;
  updatedAt: string;
}

/** Input shape for creating a highlight (server generates id/timestamps). */
export type HighlightInput = {
  verseId: string;
  color: HighlightColor;
};
