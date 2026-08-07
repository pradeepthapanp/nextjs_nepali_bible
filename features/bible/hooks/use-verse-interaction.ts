"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  useVerseActionRegistry,
  useVerseInteractionStore,
} from "../store";
import type { SelectedVerse, VerseAction, VerseSelection } from "../types";
import { isInteractiveSelectionTarget } from "../utils/selection";

/**
 * useVerseInteraction — the interaction-layer API.
 *
 * Replaces the Flutter read of `verseSelectionNotifierProvider` +
 * `ShareCopy` helpers from reader widgets. It exposes:
 *   - the current `selection` (reactive),
 *   - the registered plugin `actions`,
 *   - `select` / `toggle` / `extend` / `clear` primitives,
 *   - ready-made event handlers (click / Shift+click / Ctrl+Cmd+click /
 *     Enter / Space / right-click / long-press) that the reader wiring
 *     attaches to a verse, with built-in protection so selection never
 *     triggers on cross-reference / commentary / Strong's links.
 *
 * Fully independent from BibleHome, React Query, Supabase and the parser.
 */

export function useVerseInteraction() {
  // Selection state (selectors keep re-renders minimal).
  const active = useVerseInteractionStore((s) => s.active);
  const mode = useVerseInteractionStore((s) => s.mode);
  const verses = useVerseInteractionStore((s) => s.verses);
  const anchorId = useVerseInteractionStore((s) => s.anchorId);
  const contextMenu = useVerseInteractionStore((s) => s.contextMenu);

  // Registered plugin actions.
  const actionsMap = useVerseActionRegistry((s) => s.actions);
  const register = useVerseActionRegistry((s) => s.register);
  const registerMany = useVerseActionRegistry((s) => s.registerMany);

  const actions = useMemo<VerseAction[]>(
    () =>
      Object.values(actionsMap).sort(
        (a, b) => (a.order ?? 100) - (b.order ?? 100),
      ),
    [actionsMap],
  );

  const selection = useMemo<VerseSelection>(
    () => ({ active, mode, verses, anchorId }),
    [active, mode, verses, anchorId],
  );

  // Chapter verse order for Shift+click range extension — provided by the
  // reader wiring via `setChapterOrder` (keeps the system data-independent).
  const orderedVersesRef = useRef<SelectedVerse[]>([]);
  const setChapterOrder = useCallback((ordered: SelectedVerse[]) => {
    orderedVersesRef.current = ordered;
  }, []);

  /** Clears the selection and any native text selection. */
  const clear = useCallback(() => {
    useVerseInteractionStore.getState().clear();
    window.getSelection()?.removeAllRanges();
  }, []);

  const select = useCallback(
    (verse: SelectedVerse, additive?: boolean) => {
      useVerseInteractionStore.getState().selectVerse(verse, { additive });
    },
    [],
  );

  const toggle = useCallback((verse: SelectedVerse) => {
    useVerseInteractionStore.getState().toggleVerse(verse);
  }, []);

  const extend = useCallback(
    (verse: SelectedVerse, ordered?: SelectedVerse[]) => {
      useVerseInteractionStore
        .getState()
        .extendRangeTo(verse, ordered ?? orderedVersesRef.current);
    },
    [],
  );

  const remove = useCallback((id: string) => {
    useVerseInteractionStore.getState().removeVerse(id);
  }, []);

  const isSelected = useCallback(
    (id: string) => useVerseInteractionStore.getState().verses.some((v) => v.id === id),
    [],
  );

  // --- Event handlers ------------------------------------------------------

  // Long-press (touch) → select + open the context menu at the press point.
  const longPressRef = useRef<{
    timer: number;
    verse: SelectedVerse;
    x: number;
    y: number;
  } | null>(null);

  const cancelLongPress = useCallback(() => {
    if (longPressRef.current) {
      window.clearTimeout(longPressRef.current.timer);
      longPressRef.current = null;
    }
  }, []);

  // Clear a pending long-press timer on unmount.
  useEffect(() => cancelLongPress, [cancelLongPress]);

  /** Pointer down: tap selects; Shift+click extends; Ctrl/Cmd+click adds; touch long-press opens the context menu. */
  const onVersePointerDown = useCallback(
    (verse: SelectedVerse, event: ReactPointerEvent) => {
      if (isInteractiveSelectionTarget(event)) return;
      if (event.pointerType === "touch") {
        cancelLongPress();
        longPressRef.current = {
          timer: window.setTimeout(() => {
            const target = longPressRef.current;
            if (!target) return;
            const state = useVerseInteractionStore.getState();
            state.selectVerse(target.verse);
            state.openContextMenu({ x: target.x, y: target.y });
          }, 500),
          verse,
          x: event.clientX,
          y: event.clientY,
        };
        return;
      }
      if (event.shiftKey) {
        useVerseInteractionStore
          .getState()
          .extendRangeTo(verse, orderedVersesRef.current);
        return;
      }
      const additive = event.metaKey || event.ctrlKey;
      useVerseInteractionStore.getState().selectVerse(verse, { additive });
    },
    [cancelLongPress],
  );

  /** Pointer up / move / leave cancels a pending long-press (scroll-safe). */
  const onVersePointerUp = useCallback(
    (_verse: SelectedVerse, _event: ReactPointerEvent) => {
      cancelLongPress();
    },
    [cancelLongPress],
  );

  const onVersePointerMove = useCallback(
    (_verse: SelectedVerse, _event: ReactPointerEvent) => {
      cancelLongPress();
    },
    [cancelLongPress],
  );

  /** Keyboard selection on a focused verse (Enter / Space). */
  const onVerseKeyDown = useCallback(
    (verse: SelectedVerse, event: ReactKeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        useVerseInteractionStore.getState().toggleVerse(verse);
      }
    },
    [],
  );

  /** Right-click opens the verse context menu. */
  const onVerseContextMenu = useCallback(
    (verse: SelectedVerse, event: ReactMouseEvent) => {
      if (isInteractiveSelectionTarget(event)) return;
      event.preventDefault();
      const state = useVerseInteractionStore.getState();
      // Keep an existing multi-selection; otherwise select just this verse.
      if (!state.verses.some((v) => v.id === verse.id) || state.verses.length === 1) {
        state.selectVerse(verse);
      }
      state.openContextMenu({ x: event.clientX, y: event.clientY });
    },
    [],
  );

  return {
    selection,
    actions,
    register,
    registerMany,
    setChapterOrder,
    select,
    toggle,
    extend,
    remove,
    clear,
    isSelected,
    onVersePointerDown,
    onVersePointerUp,
    onVersePointerMove,
    onVerseKeyDown,
    onVerseContextMenu,
    contextMenu,
    closeContextMenu: () => useVerseInteractionStore.getState().closeContextMenu(),
  };
}
