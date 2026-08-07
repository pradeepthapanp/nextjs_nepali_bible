"use client";

import { useMemo, useState } from "react";
import { Cross, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { cn } from "@/utils/cn";
import { useBooks } from "../../queries";
import { useReadingStore } from "../../store";
import type { Book, Testament } from "../../types";

/**
 * BookPicker — a reusable grid for choosing a book, grouped by testament.
 *
 * Replaces the Flutter `BooksSelection` widget
 * (`lib/bible/widgets/book_selection_widget.dart`): an OT/NT segmented control
 * over a grid of books; selecting a book reports it via `onSelect` (the dialog
 * then moves to the chapter tab). Includes a client-side search field for the
 * book list (future-ready — the full verse Search feature is separate).
 *
 * Smart defaults: reads the book list from `useBooks()` and highlights the
 * current reading-store book; callers may override `books`/`value`/`onSelect`.
 */

export interface BookPickerProps {
  /** Book list; defaults to `useBooks()`. */
  books?: Book[];
  /** Book number to highlight; defaults to the reading store. */
  value?: number;
  /** Fired when a book is chosen. */
  onSelect?: (bookNumber: number) => void;
  className?: string;
}

export function BookPicker({
  books: booksProp,
  value,
  onSelect,
  className,
}: BookPickerProps) {
  const { data: fetchedBooks } = useBooks();
  const storeBookNumber = useReadingStore((state) => state.bookNumber);
  const books = booksProp ?? fetchedBooks;

  const [testament, setTestament] = useState<Testament>("ot");
  const [query, setQuery] = useState("");

  const selectedBookNumber = value ?? storeBookNumber;

  const visible = useMemo(() => {
    const byTestament = (books ?? []).filter(
      (book) => book.testament === testament,
    );
    const q = query.trim().toLocaleLowerCase("ne");
    if (!q) return byTestament;
    return byTestament.filter((book) =>
      [
        book.longName,
        book.shortName,
        book.engLongName,
        book.engShortName,
      ].some((name) => name.toLocaleLowerCase("ne").includes(q)),
    );
  }, [books, testament, query]);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Testament segmented control */}
      <div
        role="group"
        aria-label="Testament"
        className="grid grid-cols-2 gap-1 rounded-full border p-1"
      >
        {(["ot", "nt"] as const).map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={testament === item}
            onClick={() => setTestament(item)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              testament === item
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent",
            )}
          >
            {item === "ot" ? (
              <ScrollText className="size-4" aria-hidden />
            ) : (
              <Cross className="size-4" aria-hidden />
            )}
            {item === "ot" ? "पुरानो करार" : "नयाँ करार"}
          </button>
        ))}
      </div>

      {/* Search inside the book list */}
      <SearchInput
        label="खोज्नुहोस्"
        placeholder="पुस्तक खोज्नुहोस्…"
        value={query}
        onValueChange={setQuery}
      />

      {/* Book grid */}
      {visible.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {visible.map((book) => (
            <Button
              key={book.bookNumber}
              type="button"
              variant={
                book.bookNumber === selectedBookNumber
                  ? "default"
                  : "outline"
              }
              onClick={() => onSelect?.(book.bookNumber)}
              className="h-auto min-h-11 whitespace-normal px-2 py-2 text-sm leading-tight"
            >
              {book.longName}
            </Button>
          ))}
        </div>
      ) : (
        <p className="py-6 text-center text-sm text-muted-foreground">
          कुनै पुस्तक फेला परेन
        </p>
      )}
    </div>
  );
}
