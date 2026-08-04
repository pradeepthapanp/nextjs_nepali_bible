import { parseVerse } from "./verse-parser";
import type { VerseParser } from "./types";

/**
 * English verse parser — a thin wrapper over the shared engine.
 *
 * Port of Flutter `EngParse` (`eng_parse.dart`): prefixes the verse number in
 * Arabic digits (`<ev>` behaviour) and parses the verse's HTML markup.
 */
export const parseEnglishVerse: VerseParser = (verse, options) =>
  parseVerse(verse, "en", options);
