"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Eraser, Undo2, X } from "lucide-react";
import { useSupabase } from "@/providers/supabase-provider";
import { cn } from "@/utils/cn";
import {
  HIGHLIGHT_COLOR_ORDER,
  HIGHLIGHT_COLORS,
} from "../../constants";
import { useHighlightActions } from "../../hooks";
import { useHighlightStore, useVerseInteractionStore } from "../../store";

/**
 * HighlightPalette — the colour palette for the Highlight action.
 *
 * Rendered once by `VerseInteractionHost` (shown when the highlight store's
 * `paletteOpen` is true). It reads the live selection from the interaction
 * store and the live highlights from React Query, so:
 *   - the active swatch marks the single colour shared by ALL selected verses
 *     (the future "filter by colour" foundation),
 *   - tapping a colour highlights all selected verses (or clears them when
 *     they already share it — Flutter's toggle semantics),
 *   - Clear removes the highlights, Undo restores the last operation,
 *   - keyboard: 1-5 colours, 0 / Delete clear, Ctrl/Cmd+Z undo, Escape close;
 *     "h" opens the palette when a selection is active.
 *
 * Replaces the Flutter SelectionBar's highlight section
 * (`bottom_app_bar.dart`). Purely UI — all data/logic come from existing
 * hooks/stores/services.
 */
export function HighlightPalette({ className }: { className?: string }) {
  const paletteOpen = useHighlightStore((state) => state.paletteOpen);
  const openPalette = useHighlightStore((state) => state.openPalette);
  const closePalette = useHighlightStore((state) => state.closePalette);

  const verses = useVerseInteractionStore((state) => state.verses);
  const verseIds = React.useMemo(
    () => verses.map((verse) => verse.id),
    [verses],
  );

  const {
    isHighlighted,
    commonColor,
    applyToVerses,
    clearVerses,
    undo,
    canUndo,
  } = useHighlightActions();

  const { session, isLoaded } = useSupabase();
  const signedIn = isLoaded && session !== null;

  const activeColor = commonColor(verseIds);
  const anyHighlighted = verseIds.some((id) => isHighlighted(id));

  // Keep the latest action handlers in a ref (they change identity when the
  // highlight query/mutations update) so the keyboard listener below can stay
  // attached ONCE — never detached/reattached by re-renders.
  const actionsRef = React.useRef({ applyToVerses, clearVerses, undo });
  React.useEffect(() => {
    actionsRef.current = { applyToVerses, clearVerses, undo };
  }, [applyToVerses, clearVerses, undo]);

  // Keyboard shortcuts (document-level so they work from the toolbar too).
  // The listener is attached once (deps are stable zustand actions) and reads
  // the open flag, the selection and the action handlers live from stores/ref
  // on every keydown — so it never acts on a stale closure and is never torn
  // down by re-renders.
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      const open = useHighlightStore.getState().paletteOpen;
      const currentIds = useVerseInteractionStore
        .getState()
        .verses.map((verse) => verse.id);
      const { applyToVerses: apply, clearVerses: clearMany, undo: undoLast } =
        actionsRef.current;

      if (open) {
        if (event.key === "Escape") {
          event.preventDefault();
          closePalette();
          return;
        }
        if (event.key >= "1" && event.key <= "5") {
          const color = HIGHLIGHT_COLOR_ORDER[Number(event.key) - 1];
          if (color) {
            event.preventDefault();
            apply(currentIds, color);
          }
          return;
        }
        if (event.key === "0" || event.key === "Delete") {
          event.preventDefault();
          clearMany(currentIds);
          return;
        }
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
          event.preventDefault();
          undoLast();
          return;
        }
        return;
      }

      // Palette closed: "h" opens it when a selection is active.
      if (
        currentIds.length > 0 &&
        event.key.toLowerCase() === "h" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        openPalette();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openPalette, closePalette]);

  return (
    <AnimatePresence>
      {paletteOpen ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-40 z-40 flex justify-center px-4">
          <motion.div
            role="dialog"
            aria-label="Highlight palette"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "pointer-events-auto flex items-center gap-2 rounded-2xl border bg-popover p-2.5 shadow-xl",
              className,
            )}
          >
            {signedIn ? (
              <>
                {HIGHLIGHT_COLOR_ORDER.map((color, index) => {
                  const selected = activeColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => applyToVerses(verseIds, color)}
                      aria-pressed={selected}
                      aria-label={`${HIGHLIGHT_COLORS[color].label} (${index + 1})`}
                      title={`${HIGHLIGHT_COLORS[color].label} (${index + 1})`}
                      className={cn(
                        "grid size-9 place-items-center rounded-full border-2 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        HIGHLIGHT_COLORS[color].className,
                        selected
                          ? "border-foreground"
                          : "border-transparent",
                      )}
                    >
                      {selected ? (
                        <Check className="size-4 text-foreground" aria-hidden />
                      ) : null}
                    </button>
                  );
                })}

                <div className="mx-1 h-8 w-px bg-border" aria-hidden />

                <PaletteButton
                  onClick={() => clearVerses(verseIds)}
                  disabled={!anyHighlighted}
                  label="Clear highlights"
                  title="Clear (0)"
                  icon={Eraser}
                />
                <PaletteButton
                  onClick={undo}
                  disabled={!canUndo}
                  label="Undo last highlight"
                  title="Undo (Ctrl+Z)"
                  icon={Undo2}
                />
                <PaletteButton
                  onClick={closePalette}
                  label="Close palette"
                  title="Close (Esc)"
                  icon={X}
                />
              </>
            ) : (
              <>
                <p className="px-3 py-1 text-sm text-muted-foreground">
                  Sign in to highlight and sync verses.
                </p>
                <PaletteButton
                  onClick={closePalette}
                  label="Close palette"
                  title="Close (Esc)"
                  icon={X}
                />
              </>
            )}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function PaletteButton({
  onClick,
  disabled,
  label,
  title,
  icon: Icon,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  title: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={title}
      className="grid size-9 place-items-center rounded-full border bg-muted/50 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}
