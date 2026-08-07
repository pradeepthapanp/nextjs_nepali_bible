"use client";

import { useEffect } from "react";
import { useVerseInteractionStore } from "../store";

/**
 * useVerseInteractionHost — mounts the app-wide Verse Interaction behaviors.
 *
 * Call this once (see `<VerseInteractionHost>`). Ports the Flutter shell
 * behaviors from `lib/main.dart` (`PopScope` + selection clearing) and
 * `lib/global/widgets/bottom_navigation_bar.dart`:
 *
 *   - **Browser Back clears the selection before navigation.** When a
 *     selection becomes active we push a guard history entry (same URL); the
 *     first Back press pops that guard and just clears the selection, so the
 *     next Back actually navigates. (Flutter: `PopScope(canPop: selected.isEmpty)`.)
 *   - **ESC clears the selection.**
 *   - **Native text selection is cleared** whenever the verse selection
 *     changes, so a verse selection and a text selection never coexist.
 *
 * No React Query, no Supabase, no business logic.
 */
export function useVerseInteractionHost() {
  const active = useVerseInteractionStore((s) => s.active);

  // ESC + native text-selection clearing.
  useEffect(() => {
    window.getSelection()?.removeAllRanges();
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        useVerseInteractionStore.getState().clear();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active]);

  // Browser Back clears the selection before navigation (PopScope port).
  useEffect(() => {
    if (!active) return;
    // Push a guard history entry (same URL). We PRESERVE the current history
    // state (Next.js App Router stores `__NA` + its route tree there), so the
    // guard entry still looks like a legitimate Next entry and the router's
    // stack stays in sync. The first Back pops the guard and clears the
    // selection; the second Back navigates away.
    window.history.pushState(
      { ...(window.history.state ?? {}), __verseSelectionGuard: true },
      "",
    );
    const onPopState = () => {
      if (useVerseInteractionStore.getState().active) {
        useVerseInteractionStore.getState().clear();
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [active]);
}
