"use client";

import * as React from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import {
  useVerseActionRegistry,
  useVerseInteractionStore,
} from "../../store";
import type { VerseSelection } from "../../types";
import { formatSelectionReference } from "../../utils/selection";

/**
 * VerseSelectionToolbar — the plugin-driven action bar for a selection.
 *
 * Replaces the Flutter `SelectionBar` (`lib/bible/widgets/bottom_app_bar.dart`)
 * action rows: a reference badge + the registered toolbar actions + clear.
 * Actions come from the registry (Copy / Share now; Highlight, Note, Bookmark,
 * Compare, AI later), so nothing here is hardcoded. Pure client UI — it only
 * reads the interaction store and the action registry.
 */

export interface VerseSelectionToolbarProps {
  className?: string;
}

export function VerseSelectionToolbar({ className }: VerseSelectionToolbarProps) {
  const router = useRouter();
  const verses = useVerseInteractionStore((s) => s.verses);
  const clear = useVerseInteractionStore((s) => s.clear);
  const actionsMap = useVerseActionRegistry((s) => s.actions);

  const actions = React.useMemo(
    () =>
      Object.values(actionsMap)
        .filter(
          (action) =>
            action.placement === "toolbar" || action.placement === "both",
        )
        .sort((a, b) => (a.order ?? 100) - (b.order ?? 100)),
    [actionsMap],
  );

  if (verses.length === 0) return null;

  const selection: VerseSelection = {
    active: true,
    mode: verses.length > 1 ? "multi" : "single",
    verses,
  };
  const context = { selection, clear, navigate: (path: string) => router.push(path) };

  return (
    <div
      role="toolbar"
      aria-label="Verse selection actions"
      className={cn(
        "flex items-center gap-1 rounded-full border bg-popover p-1.5 shadow-lg",
        className,
      )}
    >
      <span className="max-w-40 truncate rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
        {formatSelectionReference(selection)}
      </span>

      <div className="flex items-center gap-0.5">
        {actions.map((action) => {
          const Icon = action.icon;
          const canRun = action.canRun ? action.canRun(context) : true;
          return (
            <Button
              key={action.id}
              type="button"
              variant="ghost"
              size="sm"
              disabled={!canRun}
              onClick={() => void action.run(context)}
              aria-label={action.label}
              title={action.description ?? action.label}
            >
              {Icon ? <Icon aria-hidden /> : null}
              <span className="hidden sm:inline">{action.label}</span>
            </Button>
          );
        })}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={clear}
        aria-label="Clear selection"
      >
        <X aria-hidden />
      </Button>
    </div>
  );
}
