"use client";

import { useCallback, useState } from "react";
import { copyTextToClipboard } from "@/utils/clipboard";
import { DEVOTION_SHARE_TITLE_PREFIX } from "../constants";
import { devotionToPlainText, formatDevotionDate } from "../utils";

/**
 * useDevotionShare — the devotion share action (Flutter
 * `TodaysDevotionPage._shareDevotional` → `ShareCopy.shareHtmlContent`).
 *
 * Extracts the plain-text devotion (`devotionToPlainText` — the Flutter
 * `HtmlParser.parseHTML(...).text` + tag/bracket-strip logic) and opens the
 * native share sheet with the title `"Daily Devotional - {date}"` when the
 * platform supports it (`navigator.share`), otherwise falls back to copying
 * the same text (the bible `shareAction` pattern — the shared
 * `copyTextToClipboard` from `@/utils/clipboard`).
 */
export function useDevotionShare() {
  const [isSharing, setIsSharing] = useState(false);

  const share = useCallback(async (htmlContent: string) => {
    const text = devotionToPlainText(htmlContent);
    if (!text) return;
    const title = `${DEVOTION_SHARE_TITLE_PREFIX}${formatDevotionDate()}`;
    setIsSharing(true);
    try {
      if (typeof navigator.share === "function") {
        try {
          await navigator.share({ text, title });
        } catch {
          // User dismissed the share sheet — no-op.
          return;
        }
      } else {
        await copyTextToClipboard(text);
      }
    } finally {
      setIsSharing(false);
    }
  }, []);

  return { share, isSharing };
}
