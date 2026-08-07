/**
 * Font loading for reading surfaces — shared by every feature that lets the
 * user pick a Devanagari font family for long-form reading (Bible reader,
 * Song reader, future Article reader).
 *
 * The default family is loaded by `next/font` in the root layout; every other
 * family is fetched at runtime from the Google Fonts CSS API (mirrors the
 * Flutter `google_fonts` runtime download). The stylesheet link is injected
 * once per family (module-level Set, no duplicates).
 */

/** Available Devanagari font families (from Flutter `FontList.availableFontList`). */
export const APP_FONT_FAMILIES: string[] = [
  "Noto Sans Devanagari",
  "Tiro Devanagari Hindi",
  "Mukta",
  "Karma",
  "Baloo 2",
  "Gotu",
  "Peddana",
  "Yantramanav",
  "Khula",
  "Anek Devanagari",
  "Annapurna SIL",
  "Eczar",
  "Arya",
  "Akshar",
  "Laila",
  "Rozha One",
  "Amiko",
  "Vesper Libre",
  "Kurale",
  "Sumana",
];

/** The default font family (loaded via next/font in the root layout). */
export const APP_DEFAULT_FONT_FAMILY = "Noto Sans Devanagari";

const injectedFonts = new Set<string>();

/** Google Fonts stylesheet URL for a family (space → +). */
function googleFontsUrl(family: string): string {
  return `https://fonts.googleapis.com/css2?family=${family.trim().replace(/\s+/g, "+")}&display=swap`;
}

/**
 * Ensures a font family is available by injecting its Google Fonts stylesheet
 * (idempotent). No-op for the default family (already loaded via next/font).
 */
export function loadGoogleFont(family: string): void {
  if (typeof document === "undefined") return;
  if (family === APP_DEFAULT_FONT_FAMILY) return;
  if (injectedFonts.has(family)) return;
  injectedFonts.add(family);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = googleFontsUrl(family);
  document.head.appendChild(link);
}

/** CSS `font-family` stack for a reader family (default → app sans fallback). */
export function readerFontStack(family: string): string {
  const quote = (value: string) =>
    /^[A-Za-z0-9 -]+$/.test(value) ? `"${value}"` : value;
  return `${quote(family)}, var(--font-app-sans), "Noto Sans Devanagari", sans-serif`;
}
