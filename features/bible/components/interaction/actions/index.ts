"use client";

import { registerVerseAction } from "../../../store/verse-action-registry";
import { copyAction, copyReferenceAction } from "./copy";
import { registerHighlightActions } from "./highlight";
import { shareAction } from "./share";

/**
 * Built-in verse actions.
 *
 * Copy / Copy-reference / Share / Highlight are the real, implemented
 * plugins. Future actions (Note, Bookmark, Compare, AI) register the same way
 * — one plugin object + `registerVerseAction(...)` — with zero changes to the
 * toolbar, overlay or context menu. We deliberately do NOT register stubs for
 * unimplemented future actions (no placeholder business logic); they register
 * when their features ship.
 */

let builtInRegistered = false;

/** Registers the built-in actions once (idempotent). */
export function registerBuiltInVerseActions(): void {
  if (builtInRegistered) return;
  builtInRegistered = true;
  registerVerseAction(copyAction);
  registerVerseAction(copyReferenceAction);
  registerVerseAction(shareAction);
  registerHighlightActions();
}

registerBuiltInVerseActions();
