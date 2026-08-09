/**
 * NOTE ACTION — DISABLED (commented out).
 *
 * A separate verse-note table is NOT defined yet (the `notes` table has no
 * verse reference columns), so the "Add Note" verse action is removed from
 * the selection toolbar / context menu. It was previously defined here and
 * registered in `./index.ts` alongside Copy / Share / Highlight.
 *
 * To re-enable once a Bible-reference note table exists:
 *   - restore `noteAction` (a `VerseAction`: id "note", label "Add Note",
 *     icon `StickyNote`, order 30, placement "both", run → `clear()` +
 *     `navigate("/notes/new")`),
 *   - add `import { noteAction } from "./note";` + `registerVerseAction(
 *     noteAction)` back into `registerBuiltInVerseActions()` in `./index.ts`.
 *
 * WEB ADAPTATION (when enabled): Flutter's `verse_context_sheet.dart` "Add
 * Note" tile is a stub (`onTap` only closes the sheet), so the action
 * navigates to the Notes editor (`/notes/new`) — the workflow is preserved
 * without inventing a Bible-reference schema.
 */
