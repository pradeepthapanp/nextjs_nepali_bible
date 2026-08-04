/**
 * Bible dictionary model (future capability — the Flutter app has no
 * dictionary module yet, so this is a forward-looking contract).
 */

export interface DictionaryEntry {
  id: string;
  /** Headword (e.g. a person, place, or term). */
  term: string;
  /** Optional phonetic / transliteration. */
  transliteration?: string;
  /** Definition body — may contain markup, parsed by a dictionary parser. */
  definition: string;
  /** Optional cross-reference to a Bible passage. */
  relatedReference?: string;
}
