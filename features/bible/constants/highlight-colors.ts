import type { HighlightColor } from "../types";

/**
 * Highlight color palette — the single source of truth for the colour set and
 * how each colour renders (labels + Tailwind classes). The future
 * HighlightPalette component maps over this list.
 */
export const HIGHLIGHT_COLORS: Record<
  HighlightColor,
  { label: string; className: string }
> = {
  yellow: { label: "Pahēlo", className: "bg-yellow-200/70" },
  green: { label: "Hariyo", className: "bg-green-200/70" },
  blue: { label: "Nilo", className: "bg-blue-200/70" },
  pink: { label: "Gulāfī", className: "bg-pink-200/70" },
  purple: { label: "Bāṅganī", className: "bg-purple-200/70" },
};

export const HIGHLIGHT_COLOR_ORDER: HighlightColor[] = [
  "yellow",
  "green",
  "blue",
  "pink",
  "purple",
];
