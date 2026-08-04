/**
 * Nepali digit conversion. Mirrors the Flutter `nepali_converter.dart`
 * helper used across the reader (chapter/verse numbers render in Devanagari
 * digits).
 */

const ARABIC_TO_NEPALI: Record<string, string> = {
  "0": "०",
  "1": "१",
  "2": "२",
  "3": "३",
  "4": "४",
  "5": "५",
  "6": "६",
  "7": "७",
  "8": "८",
  "9": "९",
};

const NEPALI_TO_ARABIC: Record<string, string> = Object.fromEntries(
  Object.entries(ARABIC_TO_NEPALI).map(([k, v]) => [v, k]),
);

/** Converts a number (or numeric string) to Nepali digits: 12 → "१२". */
export function toNepaliDigits(value: number | string): string {
  return String(value)
    .split("")
    .map((ch) => ARABIC_TO_NEPALI[ch] ?? ch)
    .join("");
}

/** Converts a Nepali digit string back to Arabic digits: "१२" → "12". */
export function fromNepaliDigits(value: string): string {
  return value
    .split("")
    .map((ch) => NEPALI_TO_ARABIC[ch] ?? ch)
    .join("");
}

/** Parses a Nepali digit string into a number (NaN when invalid). */
export function parseNepaliNumber(value: string): number {
  return Number(fromNepaliDigits(value));
}
