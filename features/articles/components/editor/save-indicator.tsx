"use client";

import { CheckCircle2, CloudUpload, Loader2, TriangleAlert } from "lucide-react";
import { useArticleEditorStore } from "../../store";
import { timeAgo } from "../../utils/time-ago";
import { cn } from "@/utils/cn";

export interface SaveIndicatorProps {
  /** Whether a save/create mutation is in flight (`useArticleEditor().isSaving`). */
  saving?: boolean;
  className?: string;
}

/**
 * SaveIndicator — the editor's autosave/save status (draft persisted to
 * localStorage by the `useArticleEditorStore`, saving flag from the editor
 * page). Reads the store's `autosave` directly (the store `useArticleEditor`
 * composes) so it stays in sync without a second hook instance; the `saving`
 * flag comes via props.
 */
export function SaveIndicator({ saving = false, className }: SaveIndicatorProps) {
  const dirty = useArticleEditorStore((state) => state.autosave.dirty);
  const lastSavedAt = useArticleEditorStore((state) => state.autosave.lastSavedAt);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 text-xs text-muted-foreground",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      {saving ? (
        <>
          <Loader2 className="size-3.5 animate-spin" aria-hidden /> Saving…
        </>
      ) : dirty ? (
        <>
          <TriangleAlert className="size-3.5" aria-hidden /> Unsaved changes
        </>
      ) : lastSavedAt ? (
        <>
          <CheckCircle2 className="size-3.5" aria-hidden /> Saved{" "}
          {timeAgo(lastSavedAt)}
        </>
      ) : (
        <>
          <CloudUpload className="size-3.5" aria-hidden /> Draft autosaves
          locally
        </>
      )}
    </div>
  );
}
