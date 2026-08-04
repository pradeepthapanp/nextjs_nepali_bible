"use client";

import { Bookmark, Copy, Highlighter, MessageSquarePlus, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export interface VerseActionsProps {
  onCopy?: () => void;
  onHighlight?: () => void;
  onNote?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * VerseActions — a row of per-verse action buttons (copy, highlight, note,
 * share, bookmark).
 *
 * Replaces the per-verse action affordances that Flutter showed through the
 * verse context sheet / selection menu. Purely presentational: each action is
 * a labelled icon button and the behaviour is delegated via callbacks.
 */
export function VerseActions({
  onCopy,
  onHighlight,
  onNote,
  onShare,
  onBookmark,
  disabled,
  className,
}: VerseActionsProps) {
  return (
    <div
      role="toolbar"
      aria-label="Verse actions"
      className={cn("flex items-center gap-0.5", className)}
    >
      {onCopy ? (
        <Button variant="ghost" size="sm" onClick={onCopy} disabled={disabled} aria-label="Copy verse">
          <Copy aria-hidden />
        </Button>
      ) : null}
      {onHighlight ? (
        <Button variant="ghost" size="sm" onClick={onHighlight} disabled={disabled} aria-label="Highlight verse">
          <Highlighter aria-hidden />
        </Button>
      ) : null}
      {onNote ? (
        <Button variant="ghost" size="sm" onClick={onNote} disabled={disabled} aria-label="Add note">
          <MessageSquarePlus aria-hidden />
        </Button>
      ) : null}
      {onShare ? (
        <Button variant="ghost" size="sm" onClick={onShare} disabled={disabled} aria-label="Share verse">
          <Share2 aria-hidden />
        </Button>
      ) : null}
      {onBookmark ? (
        <Button variant="ghost" size="sm" onClick={onBookmark} disabled={disabled} aria-label="Bookmark verse">
          <Bookmark aria-hidden />
        </Button>
      ) : null}
    </div>
  );
}
