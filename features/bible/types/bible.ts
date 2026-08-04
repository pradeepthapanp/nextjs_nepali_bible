import type { BibleVersion } from "./bible-version";

/**
 * The Bible as a domain aggregate: the canonical set of books plus the
 * available translations. Books themselves are version-independent
 * (`types/book.ts`) and are fetched separately by `useBooks`.
 */
export interface Bible {
  id: string;
  name: string;
  shortCode: string;
  description?: string;
  /** The default translation for this app instance. */
  defaultVersion?: BibleVersion;
}
