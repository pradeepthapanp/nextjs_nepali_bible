"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, ExternalLink, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { useDialog } from "@/hooks/use-dialog";
import { cn } from "@/utils/cn";
import { useBibleNavigation } from "../../hooks";
import { parseVerse } from "../../parsers";
import { useBooks, useVerseRange } from "../../queries";
import {
  useReaderSettings,
  useReadingStore,
  useReferencePopupStore,
} from "../../store";
import { toNepaliDigits } from "../../utils";
import { VerseContainer } from "../verse/verse-container";
import { VerseRenderProvider } from "../context";
import { createVerseRendererRegistry } from "../registry";

/**
 * ReferenceVersesPopup — the "popup window" for verse links.
 *
 * When a user taps a `<reflink target="Luk 4:26">`, a `<a href="B:…">`
 * anchor, a cross-reference chip or a commentary marker, this dialog shows the
 * referenced passage INLINE instead of navigating to a new chapter/page.
 *
 * Behavior:
 *   - Header shows the target reference label (e.g. "लूका ४:२६").
 *   - Body fetches the target chapter (single cached query) and renders only
 *     the referenced verse range through the SAME Verse Rendering Engine as
 *     the reader (parseVerse + VerseContainer) — no duplicated rendering.
 *   - "Open in reader" navigates to the passage via `useBibleNavigation`
 *     (URL + history + persisted position), matching the old behavior when a
 *     user wants the full chapter.
 *   - Escape / backdrop / close button dismiss it; focus returns to the link.
 *
 * Built on the shared `useDialog` lifecycle like `BibleSelectionDialog`.
 */

export function ReferenceVersesPopup() {
  const t = useTranslations("bible");
  const { open, kind, reference, crossReference, close } =
    useReferencePopupStore();
  const { data: books } = useBooks();
  const { goTo } = useBibleNavigation();
  const settings = useReaderSettings();
  const versionId = useReadingStore((state) => state.versionId);

  const { data: verseRange, isLoading, isError } = useVerseRange(
    versionId,
    {
      reference: reference ?? { bookNumber: 0, chapter: 0, verse: 1 },
      verseToEnd: crossReference?.verseToEnd,
    },
    open && Boolean(reference),
  );

  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const titleId = React.useId();

  const { onClose } = useDialog({
    open,
    onOpenChange: (next) => {
      if (!next) close();
    },
    containerRef: panelRef,
  });

  // Resolve the display book name (Nepali long name preferred, English for
  // English-version readers is out of scope — the Nepali canon is canonical).
  const targetBook = books?.find(
    (book) => book.bookNumber === reference?.bookNumber,
  );
  const bookName = targetBook?.longName ?? targetBook?.engLongName;
  const chapterLabel = reference ? toNepaliDigits(reference.chapter) : "";
  const verseStart = reference?.verse;
  const verseEnd = crossReference?.verseToEnd ?? verseStart;
  const verseLabel =
    verseStart !== undefined
      ? `${toNepaliDigits(verseStart)}${
          verseEnd && verseEnd > verseStart
            ? `–${toNepaliDigits(verseEnd)}`
            : ""
        }`
      : "";
  // Book chapter:verse — the canonical Nepali reference format.
  const label = verseLabel
    ? `${bookName ?? ""} ${chapterLabel}:${verseLabel}`.trim()
    : [bookName, chapterLabel].filter(Boolean).join(" ");

  // "Open in reader" → the real navigation (same as the old goTo behavior).
  const handleOpenInReader = () => {
    if (!reference) return;
    goTo(reference.bookNumber, reference.chapter, reference.verse ?? 1);
    close();
  };

  return (
    <AnimatePresence>
      {open && reference ? (
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
            className="relative flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border bg-popover text-popover-foreground shadow-2xl"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <header className="flex items-center justify-between border-b px-4 py-3">
              <h2 id={titleId} className="flex items-center gap-2 text-base font-semibold">
                <BookOpen className="size-4 text-primary" aria-hidden />
                <span className="truncate">{label || t("reference")}</span>
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label={t("close")}
              >
                <X aria-hidden />
              </Button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
              {isLoading ? (
                <LoadingState label={t("loadingChapter")} />
              ) : isError || !verseRange ? (
                <p className="text-sm text-muted-foreground">
                  {t("couldntLoadChapterDesc")}
                </p>
              ) : verseRange.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("emptyChapterDesc")}</p>
              ) : (
                <VerseRenderProvider
                  registry={createVerseRendererRegistry()}
                >
                  <div className="space-y-3">
                    {verseRange.map((verse) => (
                      <VerseContainer
                        key={verse.uuid}
                        tree={parseVerse(verse, "ne", {
                          redLetters: settings.redLetters,
                          verseNumber: settings.showVerseNumbers,
                        })}
                        verseId={verse.uuid}
                        className="!rounded-lg !bg-muted/40 !ring-0"
                      />
                    ))}
                  </div>
                </VerseRenderProvider>
              )}
            </div>

            <footer className="flex items-center justify-end gap-2 border-t px-4 py-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                {t("close")}
              </Button>
              <Button
                size="sm"
                onClick={handleOpenInReader}
                className="gap-1.5"
              >
                <ExternalLink className="size-3.5" aria-hidden />
                {t("openInReader")}
              </Button>
            </footer>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
