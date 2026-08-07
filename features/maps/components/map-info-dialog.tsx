"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import type { BibleMap } from "../types";
import { cleanMapTitle } from "../utils";

export interface MapInfoDialogProps {
  map: BibleMap | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * MapInfoDialog — the map "Image Information" dialog (the web replacement of
 * `BibleMapImageViewer._showInfoDialog`): shows the title and a "Download /
 * Open in Browser" action (Flutter's `launchUrl` → `window.open`) + Close.
 *
 * Built on the SHARED `useDialog` lifecycle (Escape, focus trap, scroll lock)
 * + framer-motion — the same overlay pattern the Music dialogs use; no dialog
 * machinery is re-implemented.
 */
export function MapInfoDialog({ map, open, onOpenChange }: MapInfoDialogProps) {
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const titleId = React.useId();
  const { onClose } = useDialog({ open, onOpenChange, containerRef: panelRef });

  const openInBrowser = () => {
    onClose();
    if (map?.imageUrl) window.open(map.imageUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <AnimatePresence>
      {open && map ? (
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
            className="relative z-10 w-full max-w-md rounded-xl border bg-card p-5 shadow-lg"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
          >
            <h2 id={titleId} className="text-lg font-semibold text-foreground">
              Image Information
            </h2>
            <p className="mt-3 text-sm break-words text-foreground">
              {cleanMapTitle(map.title)}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Close
              </Button>
              <Button type="button" onClick={openInBrowser}>
                <ExternalLink aria-hidden />
                Open in Browser
              </Button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
