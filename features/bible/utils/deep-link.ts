import type { BibleDeepLink } from "../types";

/**
 * Builds and parses deep-link URLs for Bible locations. Pure functions so they
 * can be reused by the router, share dialogs and the `useDeepLink` hook.
 *
 * Canonical shape:
 *   /bible/{bookNumber}/{chapter}[?verse={verse}][&v={versionId}][&p={v1,v2}]
 *   /bible/{bookNumber}[?v={versionId}]
 *   /bible/search?q={query}[&v={versionId}]
 */

/** Appends query params to a path, skipping undefined/empty values. */
function withQuery(
  path: string,
  params: Record<string, string | undefined>,
): string {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== "",
  );
  if (entries.length === 0) return path;
  const query = entries
    .map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`)
    .join("&");
  return `${path}?${query}`;
}

/** Builds a URL path+query for a deep link. */
export function buildBibleUrl(link: BibleDeepLink): string {
  switch (link.kind) {
    case "book":
      return withQuery(`/bible/${link.bookNumber}`, { v: link.versionId });
    case "chapter":
      return withQuery(`/bible/${link.bookNumber}/${link.chapter}`, {
        v: link.versionId,
      });
    case "verse":
      return withQuery(`/bible/${link.bookNumber}/${link.chapter}`, {
        verse: String(link.verse),
        v: link.versionId,
      });
    case "parallel":
      return `/bible/${link.bookNumber}/${link.chapter}?p=${link.versionIds.join(",")}`;
    case "search":
      return `/bible/search?q=${encodeURIComponent(link.query)}`;
  }
}

/** Parses a URL (path + search) into a deep link, or null when unmatched. */
export function parseBibleUrl(
  pathname: string,
  search: string,
): BibleDeepLink | null {
  if (!pathname.startsWith("/bible")) return null;
  const params = new URLSearchParams(search);
  const versionId = params.get("v") ?? undefined;

  // /bible/search?q=
  if (pathname === "/bible/search" || pathname.startsWith("/bible/search/")) {
    const query = params.get("q");
    return query ? { kind: "search", query, versionId } : null;
  }

  const segments = pathname
    .slice("/bible".length)
    .split("/")
    .filter(Boolean);
  const bookNumber = Number(segments[0]);
  if (!segments[0] || !Number.isInteger(bookNumber)) return null;
  const chapter = segments[1] !== undefined ? Number(segments[1]) : undefined;

  const parallelIds = params.get("p")?.split(",").filter(Boolean);
  if (parallelIds && parallelIds.length > 0 && chapter !== undefined) {
    return { kind: "parallel", bookNumber, chapter, versionIds: parallelIds };
  }

  if (chapter !== undefined) {
    const verseRaw = params.get("verse");
    if (verseRaw && Number.isInteger(Number(verseRaw))) {
      return {
        kind: "verse",
        bookNumber,
        chapter,
        verse: Number(verseRaw),
        versionId,
      };
    }
    if (Number.isInteger(chapter)) {
      return { kind: "chapter", bookNumber, chapter, versionId };
    }
    return null;
  }

  return { kind: "book", bookNumber, versionId };
}

/** Returns the version id carried by a deep link, or undefined. */
export function bibleLinkVersionId(
  link: BibleDeepLink | null,
): string | undefined {
  if (!link) return undefined;
  switch (link.kind) {
    case "book":
    case "chapter":
    case "verse":
    case "search":
      return link.versionId;
    case "parallel":
      return undefined;
  }
}

/** A resolved reading position (book/chapter, optional verse). */
export interface BibleLinkPosition {
  bookNumber: number;
  chapter: number;
  verse?: number;
}

/**
 * Extracts a reading position from a parsed deep link, or null when the link
 * has no chapter location (e.g. search). Used by page orchestration to read
 * the book/chapter/verse from the route.
 */
export function bibleLinkPosition(
  link: BibleDeepLink | null,
): BibleLinkPosition | null {
  if (!link) return null;
  switch (link.kind) {
    case "book":
      return { bookNumber: link.bookNumber, chapter: 1 };
    case "chapter":
      return { bookNumber: link.bookNumber, chapter: link.chapter };
    case "verse":
      return {
        bookNumber: link.bookNumber,
        chapter: link.chapter,
        verse: link.verse,
      };
    case "parallel":
      return { bookNumber: link.bookNumber, chapter: link.chapter };
    case "search":
      return null;
  }
}
