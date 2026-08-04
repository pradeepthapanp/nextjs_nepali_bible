import { toNepaliDigits } from "../utils/nepali-numbers";
import { buildBlocks, parseRichText } from "./engine";
import { defaultPlugins } from "./plugins";
import type { Verse } from "../types";
import type {
  InlineNode,
  VerseParseOptions,
  VerseRenderTree,
} from "./types";

/**
 * parseVerse — the public entry point of the Verse Rendering Engine.
 *
 * Ports `NepParse` / `EngParse`: it prefixes the verse's number (Nepali digits
 * for `ne`, Arabic for `en`) and parses the verse's HTML text into blocks.
 * Rendering is delegated to the shared engine; language only changes the
 * verse-number digits and default options.
 */
export function parseVerse(
  verse: Verse,
  language: "ne" | "en" = "ne",
  options: VerseParseOptions = {},
): VerseRenderTree {
  const opts: VerseParseOptions = {
    ...options,
    language,
    redLetters: options.redLetters ?? true,
    verseNumber: options.verseNumber ?? true,
    plugins: options.plugins ?? defaultPlugins,
  };

  const numberText =
    language === "ne" ? toNepaliDigits(verse.verse) : String(verse.verse);
  const prefix: InlineNode = { type: "verse-number", text: numberText };
  const body = parseRichText(verse.text, opts);

  let nodes = body;
  if (opts.verseNumber) {
    nodes = [...body];
    // Place the number inline with the first text run, even when the verse
    // opens with a `<pb/>` (a leading paragraph break stays before the number).
    const insertAt = nodes[0]?.type === "paragraph-break" ? 1 : 0;
    nodes.splice(insertAt, 0, prefix);
  }

  const blocks = buildBlocks(nodes);

  return { verse, blocks };
}
