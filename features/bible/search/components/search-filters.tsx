"use client";

import { X } from "lucide-react";
import { cn } from "@/utils/cn";
import { useBooks } from "../../queries";
import { useSearchStore } from "../../store";
import type { SearchPriority, SearchTestament } from "../../types";
import type { SearchMatchMode, SearchVersionScope } from "../types";

const TESTAMENT_LABELS: Record<SearchTestament, string> = {
  all: "सबै",
  ot: "पुरानो करार",
  nt: "नयाँ करार",
};

const SCOPE_LABELS: Record<SearchVersionScope, string> = {
  current: "हालको अनुवाद",
  all: "सबै अनुवाद",
};

const MODE_LABELS: Record<SearchMatchMode, string> = {
  partial: "आंशिक",
  phrase: "पूरा वाक्यांश",
  word: "पूरै शब्द",
};

const PRIORITY_LABELS: Record<SearchPriority, string> = {
  english: "अंग्रेजी",
  nepali: "नेपाली",
};

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  options: readonly T[];
  labels: Record<T, string>;
  onChange: (value: T) => void;
}

/** Small segmented control (radio-group semantics) used for the search filters. */
function Segmented<T extends string>({
  label,
  value,
  options,
  labels,
  onChange,
}: SegmentedProps<T>) {
  return (
    <fieldset className="space-y-1.5">
      <legend className="text-xs font-medium text-muted-foreground">
        {label}
      </legend>
      <div
        role="group"
        aria-label={label}
        className="grid grid-flow-col gap-1 rounded-full border bg-muted/40 p-1"
        style={{
          gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
        }}
      >
        {options.map((option) => {
          const selected = option === value;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "bg-background font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {labels[option]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/**
 * SearchFilters — testament (all/OT/NT), version scope (current/all versions)
 * and match mode (partial/phrase/word) segmented controls, plus an optional
 * active book chip. Reads/writes `useSearchStore` only — no data fetching
 * beyond the canonical book list (for the chip label).
 */
export function SearchFilters() {
  const testament = useSearchStore((state) => state.testament);
  const setTestament = useSearchStore((state) => state.setTestament);
  const versionScope = useSearchStore((state) => state.versionScope);
  const setVersionScope = useSearchStore((state) => state.setVersionScope);
  const matchMode = useSearchStore((state) => state.matchMode);
  const setMatchMode = useSearchStore((state) => state.setMatchMode);
  const priority = useSearchStore((state) => state.priority);
  const setPriority = useSearchStore((state) => state.setPriority);
  const bookNumber = useSearchStore((state) => state.bookNumber);
  const setBookNumber = useSearchStore((state) => state.setBookNumber);

  const { data: books } = useBooks();
  const book =
    bookNumber !== undefined
      ? books?.find((candidate) => candidate.bookNumber === bookNumber)
      : undefined;

  return (
    <div className="space-y-3">
      <Segmented
        label="कुन भागमा खोज्ने"
        value={testament}
        onChange={setTestament}
        options={["all", "ot", "nt"] as const}
        labels={TESTAMENT_LABELS}
      />
      <Segmented
        label="अनुवाद"
        value={versionScope}
        onChange={setVersionScope}
        options={["current", "all"] as const}
        labels={SCOPE_LABELS}
      />
      <Segmented
        label="खोज विधि"
        value={matchMode}
        onChange={setMatchMode}
        options={["partial", "phrase", "word"] as const}
        labels={MODE_LABELS}
      />
      <Segmented
        label="खोज भाषा"
        value={priority}
        onChange={setPriority}
        options={["english", "nepali"] as const}
        labels={PRIORITY_LABELS}
      />
      {book ? (
        <button
          type="button"
          onClick={() => setBookNumber(undefined)}
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-sm text-foreground transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {book.longName}
          <X className="size-3.5 text-muted-foreground" aria-hidden />
          <span className="sr-only">बुक फिल्टर हटाउनुहोस्</span>
        </button>
      ) : null}
    </div>
  );
}
