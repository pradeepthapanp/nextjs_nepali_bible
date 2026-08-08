import type { SelectedVerse, VerseSelection } from "../types";
import { toNepaliDigits } from "./nepali-numbers";

/**
 * Pure formatting helpers for the Verse Interaction System.
 *
 * These are interaction infrastructure (presentation formatting), not business
 * logic: they turn a selection into a reference string or clipboard text. No
 * data layer, no Supabase, no React Query.
 */

/** Builds "1,3-5" style ranges from (sorted) verse numbers. */
export function formatVerseRange(verses: number[]): string {
  if (verses.length === 0) return "";
  const sorted = [...new Set(verses)].sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let end = sorted[0];
  for (let i = 1; i < sorted.length; i += 1) {
    const current = sorted[i];
    if (current === end + 1) {
      end = current;
      continue;
    }
    ranges.push(start === end ? `${start}` : `${start}-${end}`);
    start = current;
    end = current;
  }
  ranges.push(start === end ? `${start}` : `${start}-${end}`);
  return ranges.join(",");
}

/** Formats a single verse reference, e.g. "मत्ती ५:१". */
export function formatVerseReference(verse: SelectedVerse): string {
  const book = verse.bookName ?? String(verse.bookNumber);
  return `${book} ${toNepaliDigits(verse.chapter)}:${toNepaliDigits(verse.verse)}`;
}

/** Formats the whole selection reference, e.g. "मत्ती ५:१,३-५". */
export function formatSelectionReference(selection: VerseSelection): string {
  const first = selection.verses[0];
  if (!first) return "";
  const sorted = [...selection.verses].sort((a, b) => a.verse - b.verse);
  const book = first.bookName ?? String(first.bookNumber);
  const range = formatVerseRange(sorted.map((verse) => verse.verse));
  return `${book} ${toNepaliDigits(first.chapter)}:${toNepaliDigits(range)}`;
}

/**
 * Strips HTML markup and `[bracket]` content from verse text (for copy/share).
 * Footnote blocks (`<f>…</f>` / `<fn>…</fn>`) are dropped ENTIRELY — content
 * included — so the copied/shared text matches the on-screen renderer, which
 * ignores footnotes.
 */
export function stripMarkup(text: string): string {
  return text
    .replace(/<f\b[^>]*>[\s\S]*?<\/f>/gi, "")
    .replace(/<fn\b[^>]*>[\s\S]*?<\/fn>/gi, "")
    .replace(/<f\s*\/>/gi, "")
    .replace(/<fn\s*\/>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\[.*?\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Builds the multi-verse clipboard text: numbered lines + reference. */
export function buildSelectionCopyText(selection: VerseSelection): string {
  if (selection.verses.length === 0) return "";
  const sorted = [...selection.verses].sort((a, b) => a.verse - b.verse);
  const reference = formatSelectionReference(selection);
  if (sorted.length === 1) {
    return `${stripMarkup(sorted[0].text)} - ${reference}`;
  }
  // Numbered lines use Nepali digits (matching the reader's verse numbers).
  const body = sorted
    .map((verse) => `${toNepaliDigits(verse.verse)}. ${stripMarkup(verse.text)}`)
    .join("\n");
  return `${body}\n\n- ${reference}`;
}

/**
 * Copies text to the clipboard (secure-context API with a legacy fallback).
 * Shared implementation — lives in `@/utils/clipboard` and is re-exported
 * here so the existing feature imports stay unchanged.
 */
export { copyTextToClipboard } from "@/utils/clipboard";

/**
 * Returns true when a pointer/keyboard event targets an interactive element
 * that must NOT trigger verse selection — cross-reference links, commentary
 * markers, future Strong's links, and any link/button. This is what keeps
 * selection from interfering with those affordances.
 */
export function isInteractiveSelectionTarget(event: {
  target: EventTarget | null;
}): boolean {
  if (!(event.target instanceof Element)) return false;
  return Boolean(
    event.target.closest(
      [
        '[data-segment="reference-link"]',
        '[data-segment="commentary-marker"]',
        '[data-segment="cross-reference"]',
        '[data-segment="strongs"]',
        "a",
        "button",
        '[role="button"]',
      ].join(","),
    ),
  );
}
