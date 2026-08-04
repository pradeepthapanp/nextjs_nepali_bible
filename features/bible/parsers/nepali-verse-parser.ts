import { parseVerse } from "./verse-parser";
import type { VerseParser } from "./types";

/**
 * Nepali verse parser — a thin wrapper over the shared engine.
 *
 * Port of Flutter `NepParse` (`nep_parse.dart`): prefixes the verse number in
 * Nepali digits (`<nv>` behaviour) and parses the verse's HTML markup
 * (`pb`, `n`, `t`, `j`, `e`, …).
 */
export const parseNepaliVerse: VerseParser = (verse, options) =>
  parseVerse(verse, "ne", options);
