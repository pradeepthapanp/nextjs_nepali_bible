"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDeepLink } from "../../hooks";
import { useSearchStore } from "../../store";
import { buildBibleUrl } from "../../utils";

/**
 * Bidirectional deep-link sync for search.
 *
 * Canonical URLs: `/bible/search?q=...&book=...` (+ `v=` version id).
 *   - URL → store only on EXTERNAL URL changes (load / back / forward):
 *     it depends solely on `currentLink`, reading the latest store values from
 *     refs, so a user-initiated store change is never clobbered by the stale
 *     URL while the store→URL write is still pending.
 *   - store → URL once the debounce has caught up to the live query (so a
 *     URL-sourced query is never wiped by an empty write on first render),
 *     then only when the encoded value actually differs from the URL.
 */
export function useSearchDeepLink(debouncedQuery: string) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentLink } = useDeepLink();

  const query = useSearchStore((state) => state.query);
  const bookNumber = useSearchStore((state) => state.bookNumber);
  const setQuery = useSearchStore((state) => state.setQuery);
  const setBookNumber = useSearchStore((state) => state.setBookNumber);

  // Latest values for the URL→store effect (avoids stale closures). Refs are
  // synced in effects (never during render) — see the sync effects below,
  // which are declared BEFORE the URL→store effect so it reads fresh values.
  const queryRef = useRef(query);
  const bookNumberRef = useRef(bookNumber);

  // Skips the store→URL write on the very first commit so a URL-sourced query
  // (still being adopted/debounced) is never wiped by an empty write.
  // NOTE: declared AFTER the store→URL effect so it runs after it on mount.
  const mountedRef = useRef(false);
  // Set by the URL→store effect whenever it applies a value; the store→URL
  // effect (same commit, runs after) checks and clears it so it never writes
  // back the pre-adoption (stale) store value in that commit.
  const appliedRef = useRef(false);

  const isSearchPath = pathname.startsWith("/bible/search");

  // Keep the refs in sync with the store values (refs may not be written
  // during render).
  useEffect(() => {
    queryRef.current = query;
  }, [query]);
  useEffect(() => {
    bookNumberRef.current = bookNumber;
  }, [bookNumber]);

  // URL → store (external changes only: load, back/forward, hydration).
  useEffect(() => {
    if (currentLink?.kind !== "search") return;
    let applied = false;
    if (currentLink.query !== queryRef.current) {
      setQuery(currentLink.query);
      applied = true;
    }
    if (
      currentLink.bookNumber !== undefined &&
      currentLink.bookNumber !== bookNumberRef.current
    ) {
      setBookNumber(currentLink.bookNumber);
      applied = true;
    }
    if (applied) appliedRef.current = true;
  }, [currentLink, setQuery, setBookNumber]);

  // store → URL (typing / filter changes), guarded by comparison.
  useEffect(() => {
    if (!isSearchPath) return;
    if (!mountedRef.current) return; // mount commit — adoption pending
    // Skip this commit if the URL→store effect just applied a value (it runs
    // first in the same commit, so the store isn't settled yet).
    if (appliedRef.current) {
      appliedRef.current = false;
      return;
    }
    // Skip until the debounce catches up to the live query — otherwise a query
    // just applied from the URL (still debouncing) would be wiped on render.
    if (debouncedQuery !== query) return;
    const link = currentLink?.kind === "search" ? currentLink : null;
    const linkQuery = link?.query ?? "";
    const linkBook = link?.bookNumber;
    const inSync =
      debouncedQuery === linkQuery &&
      (bookNumber ?? undefined) === (linkBook ?? undefined);
    if (inSync) return;
    // Clean canonical search URLs: `?q=...` (+ `?book=...`). The version is
    // not encoded (parsing still accepts `v=` / `version=` from external
    // links; without one the current reading version is used).
    router.replace(
      buildBibleUrl({
        kind: "search",
        query: debouncedQuery,
        bookNumber: bookNumber ?? undefined,
      }),
      { scroll: false },
    );
  }, [debouncedQuery, query, bookNumber, isSearchPath, currentLink, router]);

  // Mark mounted AFTER the store→URL effect (declaration order = run order).
  useEffect(() => {
    mountedRef.current = true;
  }, []);
}
