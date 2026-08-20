/**
 * SEO text-derivation helpers — pure functions that GENERATE meta
 * descriptions / excerpts for content pages from EXISTING content only.
 *
 * The rules:
 *   - NEVER invent theology or facts — every output is derived from strings
 *     already in the database (titles, topics, categories, lyrics, bodies).
 *   - NEVER modify database content — these are pure, in-memory derivations
 *     used only for `<meta>` descriptions, OG descriptions and card
 *     fallback text.
 *   - Deterministic and duplicate-free — given the same input, the same
 *     description is produced; each content item's description includes its
 *     own title so no two items share an identical description.
 *
 * These helpers are server- AND client-safe (no DOM, no React, no I/O), so
 * they can be used in `generateMetadata` (server components) and in client
 * components alike.
 */

/** Default maximum length of a generated description (Google shows ~160). */
export const SEO_DESCRIPTION_MAX = 160;

/** Default excerpt length for article cards / list rows. */
export const SEO_EXCERPT_MAX = 200;

/**
 * Normalizes whitespace (collapses newlines/runs into single spaces) and
 * trims. Leaves the text otherwise untouched — no invented wording.
 */
export function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Truncates text at a word boundary to `max` characters, appending "…".
 * Returns the input untouched when it already fits. Deterministic.
 */
export function truncateWords(text: string, max: number): string {
  const trimmed = normalizeText(text);
  if (trimmed.length <= max) return trimmed;
  const sliced = trimmed.slice(0, max);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced}…`;
}

/**
 * The first `sentenceCount` sentences of a text (split on `।`, `.`, `!`, `?`
 * — both Nepali and Latin punctuation), normalized. Returns "" for empty
 * input. Used to summarize bodies/lyrics without quoting them in full.
 */
export function firstSentences(
  text: string,
  sentenceCount = 1,
  max = SEO_DESCRIPTION_MAX,
): string {
  const normalized = normalizeText(text);
  if (!normalized) return "";
  const parts = normalized.split(/[।.!?]+/).map((part) => part.trim()).filter(Boolean);
  const summary = parts.slice(0, sentenceCount).join(". ");
  return truncateWords(summary, max);
}

/**
 * Strips HTML tags and chord markers (`[Em]`, `<b>`, …) from a string —
 * a lightweight, dependency-free equivalent of the music
 * `stripChordBrackets` + a tag regex. Used to derive descriptions from
 * lyric/article bodies (which contain markup) without rendering them.
 */
export function stripMarkup(text: string): string {
  return text
    .replace(/<[^>]*>/g, " ") // HTML tags
    .replace(/\[[^\]]*\]/g, " ") // chord markers [Em], [C#m], …
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Builds a unique, non-duplicative description for a titled content item by
 * combining its title with a derived detail. The title prefix guarantees
 * distinctness across items (no two songs/maps/playlists share a
 * description), and the detail is ALWAYS existing content.
 */
export function titledDescription(
  title: string,
  detail: string,
  max = SEO_DESCRIPTION_MAX,
): string {
  const cleanTitle = normalizeText(title);
  const cleanDetail = normalizeText(detail);
  if (!cleanDetail) return truncateWords(cleanTitle, max);
  return truncateWords(`${cleanTitle} — ${cleanDetail}`, max);
}
