"use client";

import { Copy } from "lucide-react";
import type { VerseAction } from "../../../types";
import {
  buildSelectionCopyText,
  copyTextToClipboard,
  formatSelectionReference,
} from "../../../utils/selection";

/**
 * Copy plugin actions (registered via the action registry).
 *
 * Ports the Flutter `ShareCopy.copyVerses` / `copyVerse` helpers
 * (`lib/helpers/share_copy.dart`): clipboard text of the numbered verses plus
 * the reference. `copy` writes text + reference; `copy-reference` writes just
 * the reference. Both clear the selection on success, like the Flutter flow.
 */

export const copyAction: VerseAction = {
  id: "copy",
  label: "Copy",
  icon: Copy,
  order: 10,
  placement: "both",
  description: "Copy the selected verses and their reference",
  run: async ({ selection, clear }) => {
    const text = buildSelectionCopyText(selection);
    if (!text) return;
    await copyTextToClipboard(text);
    clear();
  },
};

export const copyReferenceAction: VerseAction = {
  id: "copy-reference",
  label: "Copy reference",
  icon: Copy,
  order: 12,
  placement: "menu",
  description: "Copy only the verse reference",
  run: async ({ selection, clear }) => {
    const reference = formatSelectionReference(selection);
    if (!reference) return;
    await copyTextToClipboard(reference);
    clear();
  },
};
