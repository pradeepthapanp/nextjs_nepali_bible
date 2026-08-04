import type { DictionaryEntry } from "../types";
import { requiresTable } from "./helpers";

/**
 * Bible dictionary service.
 *
 * NOT ported: the Flutter app has no dictionary module and the schema has no
 * dictionary table. This interface is the forward contract — it stays
 * unimplemented until a dictionary source is added (no schema/SQL invention).
 */
export interface DictionaryService {
  /** Look up entries matching a term. */
  searchDictionary(term: string): Promise<DictionaryEntry[]>;
  /** Fetch a single entry by id. */
  getDictionaryEntry(id: string): Promise<DictionaryEntry | null>;
}

export class SupabaseDictionaryService implements DictionaryService {
  searchDictionary(_term: string): Promise<DictionaryEntry[]> {
    return requiresTable("DictionaryService.searchDictionary", "dictionaries");
  }
  getDictionaryEntry(_id: string): Promise<DictionaryEntry | null> {
    return requiresTable("DictionaryService.getDictionaryEntry", "dictionaries");
  }
}
