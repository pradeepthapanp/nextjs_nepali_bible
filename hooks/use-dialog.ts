"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";

interface UseDialogOptions {
  /** Whether the dialog/drawer is open. */
  open: boolean;
  /** Callback to change the open state. */
  onOpenChange: (open: boolean) => void;
  /** The panel that holds the dialog content (focus trap target). */
  containerRef: RefObject<HTMLElement | null>;
  /** Optional element to focus on open (e.g. the confirm button). */
  initialFocusRef?: RefObject<HTMLElement | null>;
}

/**
 * Shared, accessible dialog lifecycle used by `<ResponsiveDrawer>` and
 * `<ConfirmDialog>`: Escape-to-close, body scroll lock, focus trap on open and
 * focus restoration to the trigger on close. Centralizing this guarantees the
 * same behavior (and the same accessibility guarantees) in every overlay.
 */
export function useDialog({
  open,
  onOpenChange,
  containerRef,
  initialFocusRef,
}: UseDialogOptions) {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Remember which element opened the dialog so focus can be restored.
  // Declared BEFORE useFocusTrap so it captures the trigger while it is still
  // focused — otherwise the focus trap would move focus into the panel first
  // and we would "restore" to a now-unmounted element on close.
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
    }
  }, [open]);

  useLockBodyScroll(open);
  useFocusTrap({ active: open, containerRef, initialFocusRef });

  // Restore focus to the trigger when the dialog closes.
  useEffect(() => {
    if (!open) {
      previousFocusRef.current?.focus?.();
    }
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const onClose = useCallback(() => onOpenChange(false), [onOpenChange]);

  return { onClose };
}
