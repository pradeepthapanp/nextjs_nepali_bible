# Articles hooks (implemented)

Behavior hooks that compose the queries, stores, shared services and shared
infrastructure — no UI. The web replacement for the Flutter notifier/controller
usage inside pages and widgets. Hooks never query Supabase directly, never know
about Quill/Delta, and never duplicate upload/search/navigation/business logic.

## Hooks

| Hook | Replaces (Flutter) | Composes | Returns |
| --- | --- | --- | --- |
| `useArticleLibrary()` | `ArticlesPage`'s notifier usage | `useInfiniteArticles` + `useArticleFilters` (client-side category filter) + `useDeleteArticle` | flattened articles, pagination (`hasMore`/`loadMore`/`refetch`), category chip, delete flow |
| `useArticleDetail(id?)` | `ArticleDetailsPage` (`articleByIdProvider` + `incrementViewCount`) | `useArticle(id)` + `useIncrementViewCount` + `useRelatedArticles(article)` | article, loading/error, `refetch`, `related`, `bumpViewCount()` |
| `useArticleSearch()` | — (web refinement; repo `searchArticles`) | `useArticleSearchStore` + shared `useDebouncedValue` (400ms) + `useSearchArticles(debounced)` | `query`/`isSearching`/`setQuery`/`clear` + `results` |
| `useArticleFilters()` | — (web refinement) | `useArticleFilterStore` | `category` + `setCategory` |
| `useArticleReaderSettings()` | `_ArticleScaffold` reading `settingsProvider` | `useArticleReaderSettingsStore` (persisted `articles.reader-settings`) | font/line-height/paragraph-spacing/font-family/alignment/theme + setters + `reset` |
| `useCommentComposer(articleId)` | `_ArticleCommentsSectionState` + `ArticleCommentsNotifier` | `useCommentComposerStore` + `useCreate/Update/DeleteComment` + shared `useSupabase` (authorName) | draft/anonymous/sending + `submit()`/`update()`/`remove()` |
| `useArticleEditor(article?)` | `_AddEditArticlePageState` | `useArticleEditorStore` (persisted `articles.draft`) + `useCreate/UpdateArticle` + SHARED `UploadService` + `useSupabase` (authorName) | draft/autosave/`hasChanges`, `save()` (HTML-only), `uploadFeaturedImage()`, `isSaving` |
| `useArticleNavigation()` | `go_router` route objects | Next router + `useArticleNavigationStore` (pending target) | `navigate`/`openArticle`/`openCategory`/`openNew`/`openEdit`, `currentLink`, pending-target trio |
| `useRelatedArticles(article?)` | — (web-first) | `useRelatedArticlesQuery` (renamed query; composes `byCategory` cache) | `related` list + query surface |

## What each hook composes

- **React Query**: `useInfiniteArticles`, `useArticle`, `useSearchArticles`,
  `useDeleteArticle`, `useIncrementViewCount`, `useCreateArticle`,
  `useUpdateArticle`, `useCreateComment`, `useUpdateComment`,
  `useDeleteComment`, `useRelatedArticlesQuery` — all through
  `getArticleServices()` (never Supabase directly).
- **Zustand**: `useArticleFilterStore`, `useArticleSearchStore`,
  `useArticleReaderSettingsStore`, `useCommentComposerStore`,
  `useArticleEditorStore`, `useArticleNavigationStore`.
- **Shared services/infra**: the SHARED `UploadService` (featured-image upload
  via `uploadFile` — no upload logic duplicated), the shared `useSupabase`
  provider (author/commenter name), the shared `useDebouncedValue`
  (`@/hooks`), the shared `@/utils/content-type` (`fileExtension`) and
  `@/types/upload` (`UploadState`).

## Editor: HTML only, never Delta

`useArticleEditor` works exclusively with HTML. The draft's `content` is the
stored HTML (canonical format). The hook has NO Quill/Delta dependency — the
Quill editor (later phase) is responsible for converting Delta ⇄ HTML around
the store (`store.update({ content: html })` on save, `draft.content` on load).
The only "conversion-adjacent" code here is `slugify` (pure) for the create
slug — see `editor/README.md` for the full pipeline.

## Reusable infrastructure used

- `useDebouncedValue` (`@/hooks`), `useSupabase`
  (`@/providers/supabase-provider`), `UploadService` (`@/services/upload-service`),
  `UploadState` (`@/types/upload`), `fileExtension` (`@/utils/content-type`),
  `APP_FONT_FAMILIES` (`@/utils/fonts` via the reader constants).
- `slugify` (`features/articles/utils/slugify.ts`) — the documented architecture
  util contract, implemented here because the editor's create flow needs it.

## Supporting changes (small, required by the hooks)

- Renamed the queries-layer `useRelatedArticles` → `useRelatedArticlesQuery`
  so the behavior hook `useRelatedArticles` owns the public name without a
  barrel collision.
- Added `slug` to `ArticleEditorDraft` (the store) so the editor preserves the
  slug on edit.
- Added `ARTICLE_SEARCH_DEBOUNCE_MS = 400` (the Flutter `Debouncer` port) to
  the constants.
