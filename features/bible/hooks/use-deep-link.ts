"use client";

import { useCallback, useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useReadingStore } from "../store";
import type { BibleDeepLink } from "../types";
import { buildBibleUrl, parseBibleUrl } from "../utils";

/**
 * Deep-link behavior: navigates the app to a Bible location and reacts to the
 * current URL (book/chapter/verse + version/parallel params). Both directions
 * (navigate → URL, URL → reading state) live here so the reader and share
 * links stay consistent.
 */
export function useDeepLink() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const setChapter = useReadingStore((state) => state.setChapter);

  /** Push a deep link to the router (navigates + updates the URL). */
  const navigate = useCallback(
    (link: BibleDeepLink) => {
      router.push(buildBibleUrl(link));
    },
    [router],
  );

  /** Apply a parsed link to the reading store (no navigation). */
  const applyLink = useCallback(
    (link: BibleDeepLink) => {
      switch (link.kind) {
        case "chapter":
          setChapter(link.bookNumber, link.chapter);
          break;
        case "verse":
          setChapter(link.bookNumber, link.chapter, link.verse);
          break;
        case "book":
          setChapter(link.bookNumber, 1);
          break;
        case "parallel":
        case "search":
          // Handled by the parallel/search stores during the feature build.
          break;
      }
    },
    [setChapter],
  );

  // React to the current URL on bible routes (guarded while the parser is a
  // placeholder so other routes never throw).
  const link = useMemo(() => {
    if (!pathname.startsWith("/bible")) return null;
    return parseBibleUrl(pathname, searchParams.toString());
  }, [pathname, searchParams]);

  useEffect(() => {
    if (link) applyLink(link);
  }, [link, applyLink]);

  return { navigate, applyLink, currentLink: link };
}
