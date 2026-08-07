"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eraser } from "lucide-react";
import { cn } from "@/utils/cn";
import {
  useVerseActionRegistry,
  useVerseInteractionStore,
} from "../../store";
import type { VerseSelection } from "../../types";

/**
 * VerseContextMenu — the right-click / long-press action menu for a verse.
 *
 * Opens at the pointer position when the interaction store's `contextMenu` is
 * set (via `useVerseInteraction().onVerseContextMenu`) and lists the
 * menu-placed plugin actions (Copy, Copy reference, Share now; future actions
 * register the same way). Closes on outside click, Escape, scroll or resize.
 * Store-driven and position-based, so it never depends on verse DOM geometry.
 */

export interface VerseContextMenuProps {
  className?: string;
}

export function VerseContextMenu({ className }: VerseContextMenuProps) {
  const position = useVerseInteractionStore((s) => s.contextMenu);
  const verses = useVerseInteractionStore((s) => s.verses);
  const clear = useVerseInteractionStore((s) => s.clear);
  const close = useVerseInteractionStore((s) => s.closeContextMenu);
  const actionsMap = useVerseActionRegistry((s) => s.actions);

  const actions = React.useMemo(
    () =>
      Object.values(actionsMap)
        .filter(
          (action) => action.placement === "menu" || action.placement === "both",
        )
        .sort((a, b) => (a.order ?? 100) - (b.order ?? 100)),
    [actionsMap],
  );

  // Close on Escape / scroll / resize while the menu is open.
  React.useEffect(() => {
    if (!position) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const onDismiss = () => close();
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onDismiss, true);
    window.addEventListener("resize", onDismiss);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onDismiss, true);
      window.removeEventListener("resize", onDismiss);
    };
  }, [position, close]);

  const menuRef = React.useRef<HTMLDivElement | null>(null);

  const selection: VerseSelection = {
    active: verses.length > 0,
    mode: verses.length > 1 ? "multi" : "single",
    verses,
  };
  const context = { selection, clear };

  // Clamp to the viewport (guard `window` for SSR/prerender).
  const style = position
    ? {
        top:
          typeof window !== "undefined"
            ? Math.min(position.y, window.innerHeight - 48)
            : position.y,
        left:
          typeof window !== "undefined"
            ? Math.min(position.x, window.innerWidth - 220)
            : position.x,
      }
    : undefined;

  return (
    <AnimatePresence>
      {position ? (
        <div
          className="fixed inset-0 z-50"
          onPointerDown={(event) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
              close();
            }
          }}
        >
          <motion.div
            ref={menuRef}
            role="menu"
            aria-label="Verse actions"
            className={cn(
              "absolute w-52 overflow-hidden rounded-xl border bg-popover p-1.5 shadow-xl",
              className,
            )}
            style={style}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.12 }}
          >
            {actions.map((action) => {
              const Icon = action.icon;
              const canRun = action.canRun ? action.canRun(context) : true;
              return (
                <button
                  key={action.id}
                  type="button"
                  role="menuitem"
                  disabled={!canRun}
                  onClick={() => {
                    close();
                    void action.run(context);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
                >
                  {Icon ? <Icon className="size-4" aria-hidden /> : null}
                  <span>{action.label}</span>
                </button>
              );
            })}

            <div className="my-1 border-t" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                close();
                clear();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <Eraser className="size-4" aria-hidden />
              <span>Clear selection</span>
            </button>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
