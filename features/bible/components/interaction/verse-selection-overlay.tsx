"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { useVerseInteractionStore } from "../../store";
import { VerseSelectionToolbar } from "./verse-selection-toolbar";

/**
 * VerseSelectionOverlay — the floating bar shown while a selection is active.
 *
 * Replaces the Flutter `SelectionBar` presentation
 * (`lib/bible/widgets/bottom_app_bar.dart`): a bottom-anchored, animated bar
 * that appears whenever verses are selected. It is store-driven (reads the
 * interaction store) and fixed-positioned, so the selection survives
 * scrolling. It only hosts `VerseSelectionToolbar` — all actions are plugins.
 */

export interface VerseSelectionOverlayProps {
  className?: string;
}

export function VerseSelectionOverlay({ className }: VerseSelectionOverlayProps) {
  const active = useVerseInteractionStore((s) => s.active);

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          className={cn(
            "pointer-events-none fixed inset-x-0 bottom-20 z-40 flex justify-center px-4",
            className,
          )}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 14 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
        >
          <div className="pointer-events-auto">
            <VerseSelectionToolbar />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
