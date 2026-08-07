"use client";

import { usePathname } from "next/navigation";
import {
  useReaderAppearance,
  useReaderKeyboardShortcuts,
} from "../hooks";
import { BibleHome } from "./bible-home";
import { SearchPage } from "../search/components/search-page";

/**
 * BibleRouteDispatcher — route-level dispatch for the `/bible` catch-all.
 *
 * `/bible/search` (and sub-paths) render the Bible Search feature; every other
 * deep-link shape (`/bible`, `/bible/{book}`, `/bible/{book}/{chapter}`,
 * parallel/verse links) renders the reader (`BibleHome`). Both children keep
 * their own orchestration; this component only picks which one to mount.
 *
 * It also mounts the reader-wide behaviors ONCE so they apply to the reader
 * and search alike (no duplicated state): `useReaderAppearance` (reading
 * theme + font loading) and `useReaderKeyboardShortcuts` (Ctrl/Cmd ± / 0).
 */
export function BibleRouteDispatcher() {
  const pathname = usePathname();
  const isSearch =
    pathname === "/bible/search" || pathname.startsWith("/bible/search/");

  useReaderAppearance();
  useReaderKeyboardShortcuts();

  return isSearch ? <SearchPage /> : <BibleHome />;
}
