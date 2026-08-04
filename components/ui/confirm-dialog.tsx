"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useDialog } from "@/hooks/use-dialog";
import { cn } from "@/utils/cn";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  /** `destructive` renders the confirm button in the danger style. */
  variant?: "default" | "destructive";
  /** Shows a spinner and disables actions while an async action runs. */
  loading?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  className?: string;
}

/**
 * ConfirmDialog — accessible confirmation modal for destructive or important
 * actions (delete, publish, discard). Built on the shared `useDialog` hook:
 * focus trap, Escape-to-close, backdrop click, scroll lock and focus
 * restoration. Uses `role="dialog"` + `aria-modal` and links the title and
 * description for screen readers. Framer Motion animates open/close.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
  onConfirm,
  onCancel,
  className,
}: ConfirmDialogProps) {
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const confirmButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const titleId = React.useId();
  const descriptionId = React.useId();

  const { onClose } = useDialog({
    open,
    onOpenChange,
    containerRef: panelRef,
    initialFocusRef: confirmButtonRef,
  });

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

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
            aria-describedby={description ? descriptionId : undefined}
            className={cn(
              "relative w-full max-w-md rounded-xl border bg-popover p-6 text-popover-foreground shadow-2xl",
              className,
            )}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="flex gap-4">
              {variant === "destructive" ? (
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive">
                  <AlertTriangle className="size-5" aria-hidden />
                </span>
              ) : null}
              <div className="min-w-0 space-y-1.5">
                <h2
                  id={titleId}
                  className="text-base font-semibold tracking-tight"
                >
                  {title}
                </h2>
                {description ? (
                  <p
                    id={descriptionId}
                    className="text-sm text-muted-foreground"
                  >
                    {description}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse justify-end gap-2 sm:flex-row">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                {cancelLabel}
              </Button>
              <Button
                ref={confirmButtonRef}
                variant={variant === "destructive" ? "destructive" : "default"}
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? (
                  <Spinner className="size-4" aria-hidden />
                ) : null}
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
