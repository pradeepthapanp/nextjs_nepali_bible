"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/utils/cn";

export interface ResponsiveDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Which edge the panel slides in from. */
  side?: "left" | "right";
  /** Visible title; also used as the dialog's accessible name. */
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * ResponsiveDrawer — accessible slide-in panel (backdrop + drawer).
 * Built on the shared `useDialog` lifecycle: focus trap, Escape, backdrop
 * click, body scroll lock and focus restoration. Animated with Framer Motion
 * and marked `aria-modal` so assistive tech treats it as a dialog. The app
 * header uses it for the mobile navigation menu; features can reuse it for
 * filter panels and quick-actions.
 *
 * Rendered through a PORTAL to `<body>` so its `position: fixed` overlay is
 * never constrained by an ancestor containing block — e.g. a `backdrop-blur`
 * header makes itself the containing block for fixed descendants, which
 * collapsed the mobile nav drawer to the header's height (64px) instead of
 * the viewport. Portaling to `<body>` guarantees a full-height overlay no
 * matter where the drawer is composed.
 */
export function ResponsiveDrawer({
  open,
  onOpenChange,
  side = "left",
  title,
  children,
  className,
}: ResponsiveDrawerProps) {
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const titleId = React.useId();
  const mounted = useMounted();

  const { onClose } = useDialog({
    open,
    onOpenChange,
    containerRef: panelRef,
    initialFocusRef: closeButtonRef,
  });

  const isLeft = side === "left";
  const hiddenX = isLeft ? "-100%" : "100%";

  const drawer = (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
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
            aria-labelledby={title ? titleId : undefined}
            className={cn(
              "absolute inset-y-0 flex w-full max-w-xs flex-col bg-background shadow-2xl",
              isLeft ? "left-0" : "right-0",
              className,
            )}
            initial={{ x: hiddenX }}
            animate={{ x: 0 }}
            exit={{ x: hiddenX }}
            transition={{ type: "tween", duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
              {title ? (
                <h2 id={titleId} className="font-semibold">
                  {title}
                </h2>
              ) : (
                <span />
              )}
              <Button
                ref={closeButtonRef}
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close menu"
              >
                <X className="size-5" aria-hidden />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );

  // Hydration-safe: render nothing until mounted, then portal to <body>.
  if (!mounted) return null;
  return createPortal(drawer, document.body);
}
