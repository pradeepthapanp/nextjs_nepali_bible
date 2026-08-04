"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Copy, Highlighter, MessageSquarePlus, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export interface VerseSelectionOverlayProps {
  /** Whether the selection toolbar is visible. */
  open: boolean;
  onCopy?: () => void;
  onHighlight?: () => void;
  onNote?: () => void;
  onShare?: () => void;
  onClose?: () => void;
  className?: string;
}

/**
 * VerseSelectionOverlay — the floating action bar shown when a verse (or
 * verse range) is selected.
 *
 * Replaces the Flutter verse-context menu (long-press → actions). Purely
 * presentational: it renders a compact toolbar of action buttons and delegates
 * behaviour via callbacks. Positioned by the caller through `className`
 * (e.g. absolutely above the selected verse); animated with Framer Motion.
 */
export function VerseSelectionOverlay({
  open,
  onCopy,
  onHighlight,
  onNote,
  onShare,
  onClose,
  className,
}: VerseSelectionOverlayProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="toolbar"
          aria-label="Selection actions"
          initial={{ opacity: 0, y: 6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-full",
            className,
          )}
        >
          <div className="flex items-center gap-0.5 rounded-full border bg-popover p-1 shadow-lg">
            {onCopy ? (
              <Button variant="ghost" size="sm" onClick={onCopy} aria-label="Copy selection">
                <Copy aria-hidden />
              </Button>
            ) : null}
            {onHighlight ? (
              <Button variant="ghost" size="sm" onClick={onHighlight} aria-label="Highlight selection">
                <Highlighter aria-hidden />
              </Button>
            ) : null}
            {onNote ? (
              <Button variant="ghost" size="sm" onClick={onNote} aria-label="Add note to selection">
                <MessageSquarePlus aria-hidden />
              </Button>
            ) : null}
            {onShare ? (
              <Button variant="ghost" size="sm" onClick={onShare} aria-label="Share selection">
                <Share2 aria-hidden />
              </Button>
            ) : null}
            {onClose ? (
              <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close selection actions">
                <X aria-hidden />
              </Button>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
