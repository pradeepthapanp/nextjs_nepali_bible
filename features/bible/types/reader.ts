import type { CommentaryEntry } from "./commentary";
import type { CrossReference } from "./cross-reference";
import type { Verse, VerseTitle } from "./verse";

/**
 * Reader-oriented aggregates and reading state. `ChapterContent` mirrors the
 * Flutter `VerCmtRef` model (`lib/models/ver_cmt_model.dart`) — verses plus
 * optional cross references and commentary for a chapter.
 */

export interface ChapterContent {
  versionId: string;
  bookNumber: number;
  chapter: number;
  verses: Verse[];
  titles: VerseTitle[];
  crossReferences?: CrossReference[];
  commentaries?: CommentaryEntry[];
}

/**
 * The user's current reading position, persisted locally
 * (`progress-service`) and mirrored in `reading-store`. Mirrors the Flutter
 * `Setting.bookPosition` / `chapterPosition`.
 */
export interface ReadingPosition {
  versionId: string;
  bookNumber: number;
  chapter: number;
  /** Optional verse for deep-link/scroll restoration. */
  verse?: number;
  updatedAt: string;
}

/** One pane in a parallel Bible view. */
export interface ParallelPane {
  versionId: string;
  bookNumber: number;
  chapter: number;
}
