"use client";

import { Share2 } from "lucide-react";
import type { VerseAction } from "../../../types";
import {
  buildSelectionCopyText,
  copyTextToClipboard,
} from "../../../utils/selection";

/**
 * Share plugin action.
 *
 * Ports the Flutter `ShareCopy.shareVerses` (`lib/helpers/share_copy.dart`):
 * opens the native share sheet with the numbered verses + reference when the
 * platform supports it (`navigator.share`), otherwise falls back to copying
 * the same text to the clipboard.
 */

export const shareAction: VerseAction = {
  id: "share",
  label: "Share",
  icon: Share2,
  order: 20,
  placement: "both",
  description: "Share the selected verses",
  run: async ({ selection, clear }) => {
    const text = buildSelectionCopyText(selection);
    if (!text) return;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ text });
      } catch {
        // User dismissed the share sheet — keep the selection.
        return;
      }
    } else {
      await copyTextToClipboard(text);
    }
    clear();
  },
};
