/**
 * Minimal HTML entity decoding for verse text. Verse markup uses a small set
 * of entities (`&nbsp;`, `&amp;`, `&lt;`, …); numeric entities are decoded
 * too. Pure and unit-testable.
 */

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\u00A0",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  bull: "•",
};

export function decodeHtmlEntities(text: string): string {
  return text
    .replace(
      /&#x([0-9a-fA-F]+);/g,
      (_match, hex: string) => String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(
      /&#(\d+);/g,
      (_match, dec: string) => String.fromCodePoint(parseInt(dec, 10)),
    )
    .replace(/&([a-zA-Z0-9]+);/g, (match, name: string) => {
      return NAMED_ENTITIES[name] ?? match;
    });
}
