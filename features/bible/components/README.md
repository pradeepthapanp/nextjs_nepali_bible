# Bible UI components (reusable, presentational)

Reusable React components that **consume the Verse Rendering Engine's parsed
render tree** (`features/bible/parsers`). They never parse text, never fetch
data, and are individually reusable.

**No BibleHome, no ChapterViewer, no routes — not built here.** Those will be
composed from these components later.

## Conventions

- Every verse/segment component receives an **already-parsed node** (`TextNode`,
  `ParagraphNode`, …) — no HTML/text parsing happens in components.
- Child segments are rendered through `useVerseRender().renderInline/Block`
  (a `VerseRenderProvider`, or the default registry from `registry.tsx`), so
  components stay presentational and composable.
- Interactive behaviour is **delegated via callbacks** (`onOpen`, `onCopy`,
  `onToggle`, …); components hold no data and do no fetching.
- Accessible: real `<button>` elements, `aria-label`, `aria-pressed`,
  `aria-current`, `role="progressbar"`, `role="toolbar"`, keyboard focusable,
  and responsive Tailwind layouts.

## Folder map

| Folder | Contents |
| --- | --- |
| `context.tsx` | `VerseRenderProvider` + `useVerseRender()` + `renderInlineChildren` |
| `registry.tsx` | `createVerseRendererRegistry()` — node type → component wiring |
| `verse/` | Per-verse segment + interaction components |
| `chapter/` | Chapter layout + header/footer |
| `reader/` | Reader chrome (book/chapter selectors, audio, progress, toolbar) |

## Flutter widget mapping

| Component | Replaces (Flutter) |
| --- | --- |
| `VerseText` | base text rendering inside `NepParse` / `EngParse` |
| `VerseNumber` | the `<nv>` / `<ev>` number prefix in `NepParse` / `EngParse` |
| `VerseParagraph` | block flow of `NepParse` / `EngParse` / `GeneralVerseParse` |
| `VersePoetry` | (web-first; Flutter had no poetry widget) |
| `VerseTitle` | `TitleParser` output (`<t>` titles) |
| `VerseHighlight` | (inline variant; Flutter highlighted whole verses) |
| `VerseSearchHighlight` | (web-first; search match emphasis) |
| `VerseInlineNote` | the `<n>` note styling in `NepParse` / `EngParse` |
| `VerseCommentaryMarker` | commentary anchor chip around `CmtParser` |
| `VerseCrossReferenceMarker` | superscript reference markers in `RefParse` |
| `VerseReferenceChip` | the `<reflink>` handling in `CmtParser.openReference` |
| `VerseSelectionOverlay` | the verse context sheet / selection menu |
| `VerseActions` | per-verse copy/highlight/note/share affordances |
| `VerseContainer` | `FullVerParse` (verse + commentary + cross-refs row) |
| `ChapterContainer` | `single_chapter_display.dart` body list |
| `ChapterHeader` | app-bar title (book + chapter chips) in `bible_home.dart` |
| `ChapterFooter` | chapter paging / infinite navigation |
| `BookBadge` | the book chip in `bible_home.dart` |
| `BookChapterSelectorButton` | the book\|chapter pill in `bible_home.dart` |
| `AudioIndicator` | `bible_audio/widgets/play_pause_menu.dart` |
| `ReadingProgressIndicator` | reading-position UI (from `Setting.bookPosition`) |
| `ReaderToolbar` | font size / alignment / toggles popups |

## Future features (no code change needed)

Highlights, notes, Strong's numbers, footnotes, search highlighting, commentary
and cross references are supported **via props and the registry**:

- Search results use `VerseSearchHighlight` automatically through the registry.
- Inline highlights/notes/Strong's/footnotes arrive as new node types from
  engine plugins; adding a renderer in `registry.tsx` is the only change.
- Whole-verse highlight passes `highlight` to `VerseContainer`.
