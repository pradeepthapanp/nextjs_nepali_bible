# Articles components (implemented — reusable library)

Reusable presentational components + a few that compose the behavior hooks,
following the Bible/Music/Songs convention. Components receive data via props;
only the self-contained surfaces (`CommentComposer`, `ArticleSearchBar`,
`ReaderToolbar`, `ReaderSettingsPanel`) compose their hooks. No pages or routes
exist yet (the page orchestrators land later).

## Folders

- `article/` — ArticleCard, ArticleList, ArticleHeader, ArticleContent,
  ArticleMeta, CategoryChip, CategorySelector.
- `comments/` — CommentItem, CommentList, CommentComposer.
- `reader/` — ReaderToolbar, ReaderSettingsPanel.
- `search/` — ArticleSearchBar, SearchResults.
- `editor/` — ArticleEditor (Quill), EditorToolbar, FeaturedImage,
  ImageUploader, SaveIndicator, PreviewPanel.
- `dialogs/` — DeleteArticleDialog, DiscardChangesDialog (thin wrappers over
  the SHARED `ConfirmDialog`).
- `context/` — ReaderSettingsProvider + useReaderSettingsContext.

## Flutter widget mapping

| Component | Replaces (Flutter) |
| --- | --- |
| `ArticleCard` | the list `Card`/`InkWell` + `PopupMenuButton` in `ArticlesPage` |
| `ArticleList` | the `ArticlesPage` list + loading/error/empty + load-more |
| `ArticleHeader` | `_ArticleHeaderDelegate` / `_ArticleHeader` (hero) |
| `ArticleContent` | `Html(data: article.content)` + reader settings |
| `ArticleMeta` | `_InfoChip`-style metadata row |
| `CategoryChip` / `CategorySelector` | `_buildCategoryPicker` ChoiceChips |
| `CommentItem` / `CommentList` | `_CommentTile` / `_buildCommentsList` |
| `CommentComposer` | `_ArticleCommentsSectionState` input + sign-in prompt |
| `ArticleEditor` / `EditorToolbar` | `QuillController` + `QuillSimpleToolbar` (basic/advanced) |
| `ImageUploader` | `_pickImage` + the upload progress card |
| `FeaturedImage` | `CachedNetworkImage` with the `church_placeholder.png` fallback |
| `SaveIndicator` | the autosave / `_saving` status |
| `PreviewPanel` | — (web refinement; Flutter has no editor preview) |
| `ArticleSearchBar` / `SearchResults` | — (web refinement; `searchArticles` has no Flutter UI) |

## Editor boundary (HTML only — no Delta leaves)

`ArticleEditor` is the ONLY component that knows Quill. It receives `value`
(HTML), converts HTML → Delta with Quill's built-in `Clipboard.convert` (the
`html-to-delta` npm package is not published; Quill's own parser is used), and
emits HTML via `quill-delta-to-html` (the JS original of Flutter's
`vsc_quill_delta_to_html`). `onChange(html)` is the only output. `ArticleContent`
and `PreviewPanel` receive HTML and sanitize with the SINGLE shared
`sanitizeHtml` — they never see Delta.

## Hooks composed (reuse, not re-implementation)

- `CommentComposer` → `useCommentComposer(articleId)` (draft/anonymous/sending
  + submit/update/remove + sign-in gate).
- `ArticleSearchBar` → `useArticleSearch` (store query → shared
  `useDebouncedValue` → `useSearchArticles`).
- `ReaderToolbar` / `ReaderSettingsPanel` / `ArticleContent` →
  `useReaderSettingsContext()` (the `ReaderSettingsProvider` composes the
  persisted `useArticleReaderSettings`).
- `SaveIndicator` → `useArticleEditorStore.autosave` + an `isSaving` prop.
- `ImageUploader` → driven by `useArticleEditor().uploadFeaturedImage` via an
  `onFileSelected` prop (the page wires it; no upload logic is duplicated).
- The future pages orchestrate `useArticleLibrary`, `useArticleDetail`,
  `useArticleEditor` and pass props down.

## Reusable project infrastructure (reused, not duplicated)

- Design system `@/components/ui/*`: `Button`, `Card`, `Input`, `Avatar`,
  `EmptyState`, `ErrorState`, `LoadingState`, `ConfirmDialog`, `SearchInput`,
  `Label`, `Spinner`.
- Shared `ConfirmDialog` via the `dialogs/` wrappers; shared `useDialog`
  (inside ConfirmDialog), `sonner` (pages), `SearchInput` (search bar).
- Shared `sanitizeHtml` (`features/articles/utils`), `@/utils/fonts`
  (`readerFontStack`), `@/utils/cn`, `ARTICLE_FEATURED_IMAGE_FALLBACK` +
  reader constants.
- `.article-content` base typography lives in `styles/globals.css`.
