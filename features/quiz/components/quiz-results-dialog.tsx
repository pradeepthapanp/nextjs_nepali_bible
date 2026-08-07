"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";

export interface QuizResultsDialogProps {
  open: boolean;
  correct: number;
  wrong: number;
  total: number;
  onPlayAgain: () => void;
  onClose: () => void;
}

/**
 * QuizResultsDialog — the score summary dialog (the web port of Flutter
 * `QuizPage.showResultsDialog`): a circular percent ring, the Correct / Wrong
 * counts, and Play Again / Close. Built on the SHARED `useDialog` lifecycle
 * (Escape, focus trap, scroll lock) + framer-motion — the same overlay pattern
 * as the Music/Maps dialogs; no dialog machinery is re-implemented. The
 * Flutter dialog is `barrierDismissible: false` — only the two buttons (or
 * Escape, the shared web convention) close it.
 */
export function QuizResultsDialog({
  open,
  correct,
  wrong,
  total,
  onPlayAgain,
  onClose,
}: QuizResultsDialogProps) {
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const titleId = React.useId();
  const { onClose: handleClose } = useDialog({
    open,
    onOpenChange: (next) => {
      if (!next) onClose();
    },
    containerRef: panelRef,
  });
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
  // SVG ring: dasharray = percent of the circumference (r=16 → ~100.5 units).
  const ring = Math.round(percent * 1.005);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <motion.div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 w-full max-w-sm rounded-2xl border bg-card p-6 shadow-lg"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
          >
            <h2 id={titleId} className="text-center text-xl font-bold">
              Quiz Completed
            </h2>

            <div className="mt-5 flex justify-center">
              <div className="relative size-28">
                <svg className="size-full -rotate-90" viewBox="0 0 36 36" aria-hidden>
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="stroke-muted"
                    strokeWidth="4"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="stroke-primary"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${ring} 100`}
                  />
                </svg>
                <span className="absolute inset-0 grid place-items-center text-2xl font-bold">
                  {percent}%
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-1">
              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-2 text-sm">
                <span className="inline-flex items-center gap-2 font-medium">
                  <CheckCircle2 className="size-4 text-green-600" aria-hidden />
                  Correct
                </span>
                <span className="font-bold tabular-nums">{correct}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-2 text-sm">
                <span className="inline-flex items-center gap-2 font-medium">
                  <XCircle className="size-4 text-red-600" aria-hidden />
                  Wrong
                </span>
                <span className="font-bold tabular-nums">{wrong}</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onPlayAgain}>
                Play Again
              </Button>
              <Button type="button" onClick={handleClose}>
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
