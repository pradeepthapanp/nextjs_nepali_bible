"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDialog } from "@/hooks/use-dialog";
import { cn } from "@/utils/cn";

export interface DialogPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * DialogPanel — the shared music dialog surface (overlay + panel) built on the
 * shared `useDialog` lifecycle (Escape-to-close, focus trap, scroll lock, focus
 * restoration). Used by the music dialogs so overlay wiring is never
 * duplicated. Mirrors the accessibility of `ConfirmDialog`.
 */
export function DialogPanel({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: DialogPanelProps) {
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const titleId = React.useId();
  const descriptionId = React.useId();
  const { onClose } = useDialog({ open, onOpenChange, containerRef: panelRef });

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <motion.div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            className={cn(
              "relative z-10 w-full max-w-md rounded-xl border bg-card p-5 shadow-lg",
              className,
            )}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
          >
            <h2 id={titleId} className="text-lg font-semibold text-foreground">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
            <div className="mt-4">{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
