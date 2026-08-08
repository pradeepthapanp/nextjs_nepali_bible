"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { ChordDiagram } from "./chord-diagram";
import { getChordDiagram } from "./library";

export interface ChordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The chord to display (already-transposed reader string, e.g. "D/F#"). */
  chord: string | null;
}

/**
 * ChordDialog — the tappable-chord popup for the Song Reader.
 *
 * Built on the SHARED dialog infrastructure (`useDialog`): Escape-to-close,
 * backdrop click, focus trap, body scroll lock and focus restoration to the
 * tapped chord. Displays the chord name, the guitar chord diagram, and a close
 * button. Unknown chords fall back to "Diagram unavailable." No dialog logic
 * is duplicated here.
 */
export function ChordDialog({ open, onOpenChange, chord }: ChordDialogProps) {
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const titleId = React.useId();

  const { onClose } = useDialog({
    open,
    onOpenChange,
    containerRef: panelRef,
    initialFocusRef: closeButtonRef,
  });

  const diagram = chord ? getChordDiagram(chord) : null;
  const name = diagram ? diagram.name : chord ?? "";

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative w-full max-w-xs rounded-xl border bg-popover p-5 text-popover-foreground shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 id={titleId} className="text-lg font-bold tracking-tight">
                {name}
              </h2>
              <Button
                ref={closeButtonRef}
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Close chord diagram"
                onClick={onClose}
              >
                <X className="size-5" aria-hidden />
              </Button>
            </div>

            {diagram ? (
              <div className="mt-2 flex flex-col items-center">
                <ChordDiagram diagram={diagram} />
                {diagram.bassNote ? (
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    Bass: {diagram.bassNote}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Diagram unavailable.
              </p>
            )}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
