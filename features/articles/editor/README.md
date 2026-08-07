# Articles editor (implemented) — Quill / Delta analysis + platform

The Quill Editor Platform — reusable editor internals for article content.
**HTML is the canonical format**: the database stores HTML, and the editor
exposes only HTML (plus selection / formatting commands / undo / redo / image /
link / divider / code-block / quote / heading / list). Quill Delta is used ONLY
internally, inside this folder, and never leaks out.

## The Flutter Quill pipeline (as implemented)

`AddEditArticlePage` (`lib/articles/add_edit_article_page.dart`) uses:

- **`flutter_quill`** — a faithful Dart port of Quill.js. Its document format
  IS the **Quill Delta** spec (ops/attributes).
- **Save** → `vsc_quill_delta_to_html` (`QuillDeltaToHtmlConverter`) converts
  the editor's Delta to **HTML**, which is what is persisted in
  `articles.content`.
- **Load** → `flutter_quill_delta_from_html` (`HtmlToDelta`) converts the
  stored HTML back into a Delta for the editor.
- **Reader** → `flutter_html` renders the stored **HTML** directly (the reader
  never sees Delta).

**Key fact: the database stores HTML, not Delta JSON.** The Delta exists only
inside the editor session. This is critical to the preservation question.

## Can the existing Quill Delta format be preserved exactly? — YES

1. **The Delta spec is identical across platforms.** `flutter_quill` and web
   **Quill.js** both implement the Quill Delta format (ops: insert with
   attributes; embeds: image/video/formula). A Delta produced by flutter_quill
   is byte-compatible with a Delta consumed by Quill.js.

2. **The converters are the same packages.** `vsc_quill_delta_to_html` is a
   Dart port of the JS package **`quill-delta-to-html`** (used directly), and
   `flutter_quill_delta_from_html` is a port of the JS package `html-to-delta`
   — which is NOT published on npm, so the HTML→Delta direction uses Quill's
   own `Clipboard.convert` (functionally equivalent for Quill-generated HTML).

3. **The storage contract stays HTML.** Since the DB stores HTML (not Delta),
   the web preserves existing content verbatim by keeping the same
   HTML-in / HTML-out pipeline: stored HTML → Quill `Clipboard.convert` → Delta
   (editor) → `quill-delta-to-html` → stored HTML. Round-tripping existing rows
   yields the same output Flutter produced.

**Conclusion:** the editor is built around **Quill.js**. **No CKEditor
migration** — there is no technical reason to abandon Quill; doing so would
break the stored-HTML contract and force a content migration.

## Single HTML ⇄ Delta boundary

```
articles.content (HTML) ──QuillAdapter.loadHtml──▶ QuillAdapter (owns Quill)
        ▲                                            │  HtmlConverter.deltaToHtml
        └───────────────QuillAdapter.getHtml─────────┘
```

**`QuillAdapter` is the ONLY module that converts HTML ⇄ Delta** (through
`HtmlConverter`, which it exclusively owns). No other file in the app converts.
Delta never leaves `features/articles/editor` — the public surface is HTML,
selection, commands, undo/redo and the inserts.

## Modules

| Module | Flutter Quill equivalent | Responsibility |
| --- | --- | --- |
| `quill-adapter.ts` | `QuillController` + `QuillSimpleToolbar` actions + the converter wiring | THE adapter: owns the Quill instance, the HTML boundary (`loadHtml`/`getHtml`), the managers + the text-change → HTML emit + autosave scheduling |
| `html-converter.ts` | `QuillDeltaToHtmlConverter` / `HtmlToDelta` | Internal HTML⇄Delta primitives (used ONLY by QuillAdapter). `deltaToHtml` splits at `divider` embeds → `<hr>`; `htmlToDelta` uses Quill's clipboard |
| `selection-manager.ts` | `QuillController.selection` + `onSelectionChanged` | get/set selection + change events |
| `editor-history.ts` | `QuillController.undo` / `.redo` | undo / redo / clear / canUndo / canRedo |
| `editor-commands.ts` | `QuillController.formatSelection` + `insertEmbed`/`insertText` | bold/italic/underline/strike/code/quote/heading/list/align/clear + insert text/link/image/divider |
| `image-embed-handler.ts` | — (web-first; Flutter has no inline images) | uploads images via the SHARED `UploadService` and inserts the `image` embed |
| `clipboard-handler.ts` | Quill's clipboard + `FlutterQuill` paste handling | intercepts pasted image files → upload via the shared service |
| `auto-save-manager.ts` | the editor's autosave intent | debounced `getHtml()` → `onAutoSave(html)` (wired to `useArticleEditorStore`) |
| `divider-blot.ts` | Flutter `DividerEmbed` | registers the custom `divider` embed (`<hr class="ql-divider">`) |
| `types.ts` | — | `EditorSelection` / list / heading / align (the only public-shaped types) |

## Reuse (nothing duplicated)

- **UploadService** — `ImageEmbedHandler` (and `ClipboardHandler` via it) use
  the SHARED `@/services/upload-service` (`uploadFile`) — no upload logic here.
- **useArticleEditor** — the `ArticleEditor` component wires the adapter's
  `onAutoSave` to `useArticleEditorStore.update({ content: html })` (the
  persisted draft store `useArticleEditor` composes).
- **Shared dialogs** — the discard/delete confirms reuse the shared
  `ConfirmDialog` (via `components/dialogs`).

## Editor API (the public surface)

`QuillAdapter` exposes: `loadHtml(html)` / `getHtml()` / `isEmpty()` (HTML),
`selection` (get/set/focus), `commands` (format + insert text/link/image/
divider/heading/quote/code-block/list), `history` (undo/redo),
`images` (insert image file/URL), `clipboard`, `autosave`, `enable`, `destroy`.
No `Delta` type is exported from `editor/index.ts`.

## Scope decisions (matching Flutter exactly)

- **Image insertion**: Flutter's editor does NOT embed images inside the Quill
  document (no image button in the toolbar). The web adds inline-image support
  (`ImageEmbedHandler` via the shared UploadService) as a platform capability;
  the editor exposes it, the UI decides whether to surface it.
- **Draft / Publish**: a `published` checkbox on the editor (draft =
  unpublished). `PreviewPanel` (a web refinement) renders a live sanitized
  preview.
- **Discard guard**: `PopScope` + `_hasChanges` → the shared `DiscardChangesDialog`
  on the web; `hasChanges` compares the current Delta→HTML against the stored
  HTML.
