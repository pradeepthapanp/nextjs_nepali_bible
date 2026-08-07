"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { cn } from "@/utils/cn";
import { useBibleNavigation } from "../../hooks";
import { useBibles, useBooks } from "../../queries";
import {
  useBibleSelectionStore,
  useReadingStore,
  useRecentStore,
} from "../../store";
import { toNepaliDigits } from "../../utils";
import { BibleVersionPicker } from "./bible-version-picker";
import { BookPicker } from "./book-picker";
import { ChapterPicker } from "./chapter-picker";

/**
 * BibleSelectionDialog — the tabbed book/chapter/version selector.
 *
 * Replaces the Flutter `VerSelection` screen (`lib/bible/ver_selection.dart`):
 * a modal with BOOK / CHAPTER tabs (the VERSE tab is intentionally not built —
 * Verse Selection is a separate future feature) plus the Bible version picker.
 * Selecting a book moves to the chapter tab (URL untouched); picking a chapter
 * performs the actual navigation via `useBibleNavigation` (URL + history +
 * persisted position + recents) and closes. Recently opened books and recently
 * used versions are offered for quick re-opening.
 *
 * Built on the shared `useDialog` lifecycle (focus trap, Escape, backdrop,
 * scroll lock, focus restoration) with Framer Motion.
 */

export function BibleSelectionDialog() {
  const {
    open,
    tab,
    bookNumber,
    setTab,
    setBookNumber,
    close,
  } = useBibleSelectionStore();
  const { data: books } = useBooks();
  const { data: versions } = useBibles();
  const { goTo, goToVersion } = useBibleNavigation();
  const { recentBooks, recentVersions } = useRecentStore();
  const storeChapter = useReadingStore((state) => state.chapter);

  const currentBook = books?.find((entry) => entry.bookNumber === bookNumber);
  const bookName = currentBook?.longName ?? String(bookNumber);
  // Highlight a chapter that is in range of the pending book.
  const pendingChapter = currentBook
    ? Math.min(Math.max(storeChapter, 1), currentBook.chapters)
    : storeChapter;

  const recentBooksData = React.useMemo(
    () =>
      (books ?? []).filter((book) => recentBooks.includes(book.bookNumber)),
    [books, recentBooks],
  );
  const recentVersionsData = React.useMemo(
    () => (versions ?? []).filter((version) => recentVersions.includes(version.id)),
    [versions, recentVersions],
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

  const handleBookSelect = (nextBook: number) => {
    setBookNumber(nextBook);
    setTab("chapter");
  };
  const handleChapterSelect = (chapter: number) => {
    goTo(bookNumber, chapter);
    close();
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
            className="relative flex max-h-[85dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl border bg-popover text-popover-foreground shadow-2xl"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <header className="flex items-center justify-between border-b px-4 py-3">
              <h2 id={titleId} className="text-base font-semibold">
                {tab === "book" ? "पुस्तक चयन" : "अध्याय चयन"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close selection"
              >
                <X aria-hidden />
              </Button>
            </header>

            {/* Bible version + recently used versions */}
            <div className="space-y-2 border-b px-4 py-3">
              <BibleVersionPicker />
              {recentVersionsData.length > 0 ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    भर्खरै:
                  </span>
                  {recentVersionsData.map((version) => (
                    <button
                      key={version.id}
                      type="button"
                      onClick={() => goToVersion(version.id)}
                      className="rounded-full border border-input px-2.5 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {version.shortCode}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {/* BOOK / CHAPTER tabs */}
            <div
              role="tablist"
              aria-label="Selection type"
              className="mx-4 mt-3 grid grid-cols-2 gap-1 rounded-full border p-1"
            >
              {(["book", "chapter"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={tab === item}
                  onClick={() => setTab(item)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    tab === item
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent",
                  )}
                >
                  {item === "book" ? "पुस्तक" : "अध्याय"}
                </button>
              ))}
            </div>

            {/* Tab body */}
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
              {tab === "book" ? (
                <div className="space-y-4">
                  {recentBooksData.length > 0 ? (
                    <section aria-label="Recently opened books">
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        भर्खरै खोलिएका पुस्तकहरू
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {recentBooksData.map((book) => (
                          <button
                            key={book.bookNumber}
                            type="button"
                            onClick={() => handleBookSelect(book.bookNumber)}
                            className="inline-flex items-center gap-1 rounded-full border border-input px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <BookOpen className="size-3.5" aria-hidden />
                            {book.longName}
                          </button>
                        ))}
                      </div>
                    </section>
                  ) : null}
                  <BookPicker value={bookNumber} onSelect={handleBookSelect} />
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-primary">
                    {bookName} — {toNepaliDigits(currentBook?.chapters ?? 0)}{" "}
                    अध्याय
                  </p>
                  <ChapterPicker
                    book={currentBook}
                    value={pendingChapter}
                    onSelect={handleChapterSelect}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
