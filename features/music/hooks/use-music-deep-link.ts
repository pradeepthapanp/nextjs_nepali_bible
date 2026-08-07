"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useReaderNavigationStore } from "../store";
import type { MusicDeepLink } from "../types";
import { buildMusicUrl, parseMusicUrl } from "../utils";

/**
 * useMusicDeepLink — the generic deep-link behavior for the Music section
 * (the counterpart to the Bible module's `useDeepLink`).
 *
 * Composes the pure `parseMusicUrl`/`buildMusicUrl` utilities with the
 * `ReaderNavigationStore` (pending navigation context) and the Next router:
 * - `navigate(link)` — push a built deep-link URL (browser history + refresh
 *   -safe location);
 * - `currentLink` — the parsed URL of the current `/music` route (or null);
 * - `pendingTarget` / `setPendingTarget` / `consumePendingTarget` — a one-shot
 *   deep-link target to apply once the section mounts.
 */
export function useMusicDeepLink() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pendingTarget = useReaderNavigationStore((state) => state.pendingTarget);
  const setPendingTarget = useReaderNavigationStore(
    (state) => state.setPendingTarget,
  );

  /** Push a deep link to the router (navigates + updates the URL). */
  const navigate = useCallback(
    (link: MusicDeepLink) => router.push(buildMusicUrl(link)),
    [router],
  );

  /** The parsed deep link of the current route, or null off `/music`. */
  const currentLink = useMemo(() => {
    if (!pathname.startsWith("/music")) return null;
    return parseMusicUrl(pathname, searchParams.toString());
  }, [pathname, searchParams]);

  /** Reads and clears the pending target (applied exactly once). */
  const consumePendingTarget = useCallback(
    () => useReaderNavigationStore.getState().consumePendingTarget(),
    [],
  );

  return {
    navigate,
    currentLink,
    pendingTarget,
    setPendingTarget,
    consumePendingTarget,
  };
}