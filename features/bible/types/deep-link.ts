import type { BibleVersion } from "./bible-version";

/**
 * Deep-link model for sharing / opening specific Bible locations.
 * Canonical URL shape (see utils/deep-link.ts):
 *   /bible/{bookNumber}/{chapter}[?verse={v}][&v={versionId}][&p={versionId,...}]
 */
export type BibleDeepLink =
  | { kind: "book"; bookNumber: number; versionId?: string }
  | { kind: "chapter"; bookNumber: number; chapter: number; versionId?: string }
  | {
      kind: "verse";
      bookNumber: number;
      chapter: number;
      verse: number;
      versionId?: string;
    }
  | {
      kind: "parallel";
      bookNumber: number;
      chapter: number;
      versionIds: string[];
    }
  | {
      kind: "search";
      query: string;
      versionId?: string;
      /** Restrict search to one book (e.g. `?book=470`). */
      bookNumber?: number;
      /** Version short code (e.g. `?version=nnrv`); resolved via `useBibles`. */
      versionShortCode?: string;
    };

/** Metadata needed to build a deep link (used by utils/deep-link.ts). */
export interface DeepLinkContext {
  version: BibleVersion;
}
