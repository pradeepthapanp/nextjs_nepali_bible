# Articles feature (implemented)

Production-grade Next.js architecture for the Articles feature, derived from a
full study of the Flutter implementation. Layers implemented bottom-up:
types → constants → services → React Query → Zustand → behavior hooks →
reusable components → Quill Editor Platform → **pages/routes** (this phase).
Each layer reuses the previous ones; pages only compose behavior hooks +
reusable components (no parsing / sanitizing / Supabase / Delta / upload logic
in pages).

## Folder responsibilities

| Folder | Responsibility |
| --- | --- |
| `types/` | Domain contracts: `Article`, `ArticleCategory`, `ArticleComment` (+ the dead `ArticleCategoryRow`). Implemented. |
| `constants/` | Data constants: category labels/order, pagination sizes, editor/upload tuning, reader settings. Implemented. |
| `queries/` | React Query cache keys (`articlesKeys`) + every query/mutation hook. Implemented. |
| `services/` | Data access: `ArticleService` (articles + comments), plus the SHARED `UploadService` / `ProfileService` + `Profile` / `UploadState` types (`@/types`). Implemented. |
| `store/` | Zustand UI state: editor draft/autosave, comment composer, list filter, search, reader settings, navigation. Implemented. |
| `hooks/` | Behavior hooks composing queries/stores/editor/shared utilities. Implemented. |
| `components/` | Presentational components + page orchestrators (Bible/Music/Songs convention). Implemented. |
| `editor/` | The Quill Editor Platform (HTML ⇄ Delta single-boundary adapter). Implemented. |
| `utils/` | Pure helpers: `slugify`, `timeAgo`, `sanitizeHtml`. Implemented. |

## Full Flutter → Next mapping

### Pages (implemented — see `components/{article-list-page,article-detail-page,add-edit-article-page,article-route-dispatcher}.tsx`)

| Flutter | React page | Route | Key behavior |
| --- | --- | --- | --- |
| `ArticlesPage` (`articles_page.dart`) | `ArticleListPage` | `/articles` (+ `?category=`) | infinite list (page 10) + load-more; client-side category filter (`useArticleFilters`); web-refinement search (`useArticleSearch`); loading/error/empty (`ArticleList`); admin Add button + per-card edit/delete (`canManage` from `useArticleLibrary`); deep-link `?category=` applied to the filter store |
| `ArticleDetailsPage` (`article_details_page.dart`) | `ArticleDetailPage` | `/articles/{id}` | article resolved by id from the URL (refresh/deep-link safe, `useArticleDetail`); one-shot view-count bump; reader settings (`ReaderSettingsProvider` + `ReaderToolbar` + `ReaderSettingsPanel`); sanitized HTML (`ArticleContent`); comments (`useArticleComments` + `CommentComposer` + `CommentList`); related articles (`useRelatedArticles` → `ArticleList`); Share (navigator.share → `copyTextToClipboard`); browser back/forward |
| `ArticlesWithCategoryPage` (`articles_with_category_page.dart`) | — | — | **DEAD/commented in Flutter** — not built (category filtering is client-side on the list; `byCategory` query key kept for parity) |
| `AddEditArticlePage` (`add_edit_article_page.dart`) | `AddEditArticlePage` | `/articles/new`, `/articles/edit/{id}` | composes `useArticleEditor` + `ArticleEditor`/`EditorToolbar`/`ImageUploader`/`FeaturedImage`/`SaveIndicator`/`PreviewPanel` + `CategorySelector` + shared `DiscardChangesDialog`; admin-only gate; advanced-toolbar toggle; published checkbox; discard guard; lazy-loaded (`ssr:false` — Quill must never enter the server bundle) |
| — | `ArticleRouteDispatcher` | mounted by `app/articles/[[...segments]]/page.tsx` | routes the catch-all via `parseArticlePath` → the four pages; consumes a one-shot `pendingTarget` |

### Widgets → components

| Flutter widget | React component (future) |
| --- | --- |
| list `Card`/`InkWell` (in `ArticlesPage`) | `components/article-card.tsx` |
| `_ArticleHeaderDelegate` (SliverPersistentHeader) | `components/article-hero.tsx` |
| `_ArticleHeader` + `_InfoChip` | `components/article-meta.tsx` |
| `Html(data: article.content)` | `components/article-content.tsx` (sanitized) |
| `ArticleCommentsSection` / `_CommentTile` | `components/article-comments-section.tsx` / `article-comment-tile.tsx` |
| `_buildCategoryPicker` (ChoiceChips) | `components/article-category-picker.tsx` |

### Providers / notifiers → queries + store

| Flutter provider | React Query hook (future) | Zustand store |
| --- | --- | --- |
| `ArticlesNotifier` | `useInfiniteArticles` + `useArticleMutations` | — (server data in cache) |
| `articleByIdProvider` (family) | `useArticle(id)` | — |
| `ArticlesWithCategoryNotifier` (dead) | `useArticlesByCategory` (optional) | — |
| `ArticleCommentsNotifier` (family) | `useArticleComments` + `useArticleCommentMutations` | `useArticleCommentStore` (composer) |
| `currentUserProvider` | `useCurrentProfile` (shared) | — |
| `UploadNotifier` | `useAudioUpload`-style (shared upload hook) | `useArticleEditorStore` (draft/autosave) |
| `_AddEditArticlePageState` (controllers) | `useArticleEditor` | `useArticleEditorStore` |

### Models → types

| Flutter model | React type |
| --- | --- |
| `Article` | `types/article.ts` (`Article`, `ArticleInput`) |
| `ArticleCategory` (enum) | `types/category.ts` + labels in `constants/categories.ts` |
| `ArticleCategoryModel` (`article_categories` table) | `types/category.ts` `ArticleCategoryRow` (**dead** in Flutter) |
| `ArticleComment` | `types/comment.ts` (`ArticleComment`, `ArticleCommentInput`) |

### Repository methods → services

| Flutter `SupabaseRepository` method | Service method (future) |
| --- | --- |
| `fetchArticles(limit, offset)` | `article.getArticles({limit, offset})` |
| `fetchArticle(id)` | `article.getArticle(id)` |
| `createArticle` / `updateArticle` | `article.createArticle` / `article.updateArticle` (return the row) |
| `deleteArticle(id)` | `article.deleteArticle(id)` (+ featured-image file delete) |
| `incrementViewCount(id, currentCount)` | `article.incrementViewCount(id)` |
| `searchArticles(query)` | `article.searchArticles(query)` (no Flutter UI — optional web refinement) |
| `fetchArticleComments` / `insertArticleComment` / `updateArticleComment` / `deleteArticleComment` / `fetchArticleCommentsPagination` | `article.getArticleComments` / `insertArticleComment` / `updateArticleComment` / `deleteArticleComment` |
| `fetchCategories`/`createCategory`/`updateCategory`/`deleteCategory` (`article_categories`) | — (dead; optional admin category mgmt) |
| `uploadImage` / `deleteFile` (`UploadNotifier`) | **shared** `UploadService` — now at `@/services/upload-service` (`uploadFile(blob, path, onProgress)`) |
| `fetchProfileById` | **shared** `ProfileService` — now at `@/services/profile-service` (`getProfileById`) |

## Reusable project infrastructure

Already shared and reused by Articles:
- **Shared design system** `@/components/ui/*` (Button, Card, Input, Label,
  Avatar, EmptyState, ErrorState, LoadingState, ConfirmDialog, SearchInput).
- **Shared hooks** `@/hooks`: `useDialog`, `useDebouncedValue`.
- **Shared providers/utilities**: `useSupabase`, `sonner` toasts, `@/utils/cn`,
  `@/services/helpers` (`unwrap`).
- **Shared pagination pattern** — the infinite-scroll + load-more convention
  from Music/Online Songs (React Query `useInfiniteQuery`).
- **Shared Loading/Error/Empty states** via the design-system primitives.
- **Shared deep-link convention** — route = id (web-first resolution), the
  `parseXUrl`/`buildXUrl` pattern is trivial here (simple `/articles/{id}`).

Shared infrastructure already EXTRACTED to `@/` (no feature imports needed):
- **`ProfileService` + `canManage`** — `@/services/profile-service.ts` + `@/types/profile.ts`
  (admin/editor gating; used by Online Songs today, Articles next).
- **`UploadService`** — `@/services/upload-service.ts` (`uploadFile`/`deleteFile`);
  the featured-image upload + media delete for the editor.
- **`Profile` / `UserRole` / `UploadState`** — `@/types/profile.ts`, `@/types/upload.ts`.
- **`mediaPathFromUrl` + `MEDIA_BASE_URL`** — `@/utils/media.ts`.
- **`getContentType` / `fileBaseName` / `fileExtension`** — `@/utils/content-type.ts`.
- **Reader fonts** (`APP_FONT_FAMILIES`, `loadGoogleFont`, `readerFontStack`) — `@/utils/fonts.ts`
  (the feature-independent subset of reader settings).
- **Reader settings STORE** (font size / line height / text alignment / theme) —
  still the Bible module's `useReaderSettings`; it is NOT fully feature-independent
  (mixes Bible display toggles), so it is NOT promoted yet — the Article reader
  will reuse the generic subset (font/line-height/alignment/theme) directly.
- **Shared Audio Platform** (`@features/audio`) — NOT needed today (articles
  have no audio), but reusable if articles later embed audio.

## Intentional differences from Bible and Music

1. **Rich text editor + HTML content** — the first feature with a WYSIWYG
   editor (`editor/` — Quill.js, Delta preserved; see `editor/README.md`) and
   sanitized **HTML** content rendering. Bible/Music render structured parsed
   trees (verse nodes, lyrics nodes); Articles renders Quill-generated HTML.
   The Bible verse parser is NOT reused (different HTML).
2. **Simple routing behind one dispatcher** — the four routes live under a
   single optional catch-all `app/articles/[[...segments]]/page.tsx` +
   `ArticleRouteDispatcher` (same pattern as Bible/Music), so one thin server
   shell owns the `Suspense` boundary (`ArticleListPage` uses `useSearchParams`
   for the `?category=` deep link) and the editor page stays `ssr:false`.
3. **List = infinite + client-side category filter + web-refinement search** —
   the list is infinite scroll (`useInfiniteArticles`) with a client-side
   category chip filter (`useArticleFilters` + `CategorySelector`, deep-linked
   via `?category=`) and a debounced search (`useArticleSearch` + `ArticleSearchBar`
   → `SearchResults`). Flutter's list had no filter UI — these are web
   refinements built from the existing layers (Music-style chips/search).
4. **Shared reader settings** — Articles should REUSE the promoted global
   reader settings (font/line-height/alignment), unlike Music which kept a
   feature-local `song-settings` store. This avoids a third copy of reader
   preferences.
5. **First cross-user content feature** — comments introduce the
   sign-in-gated mutation + author-ownership (`isMine`) pattern on the web;
   the comment list is article-specific (not yet generic enough to share with
   the Community feature).
6. **Admin CRUD includes media uploads** — the Add/Edit form uploads a
   featured image (shared UploadService), like Online Songs; Bible/Music have
   no such upload surface in the reader.

## Quill / Delta conclusion (summary)

**YES — preserve Quill.** The DB stores HTML (not Delta); Quill.js uses the
same Delta spec as flutter_quill, and the JS `quill-delta-to-html` /
`html-to-delta` are the originals that the Flutter converter packages ported.
The web editor is designed around Quill.js with the exact same
HTML⇄Delta pipeline — **no CKEditor migration**. Full analysis + design in
`editor/README.md`.

## Scope (implemented layers)

Built bottom-up across phases: `types/`, `constants/`, `services/` (data
layer), `queries/` (React Query), `store/` (Zustand), `hooks/` (behavior),
`components/` (reusable library), `editor/` (Quill Editor Platform) and now
`components/{article-list-page,article-detail-page,add-edit-article-page,
article-route-dispatcher}.tsx` + the `app/articles/[[...segments]]` route.

## Pages — implementation notes & verification

- **ArticleListPage** composes `useArticleLibrary` (infinite list + category
  filter + delete + `canManage`), `useArticleSearch` (debounced search) and
  `useArticleNavigation` (deep links). Reuses `ArticleList`, `CategorySelector`,
  `ArticleSearchBar`, `SearchResults`. The `?category=` deep link (and
  browser back/forward) syncs into the filter store via a zustand action in an
  effect (never React setState). Delete mirrors Flutter's toasts via the
  mutation callbacks forwarded through `useArticleLibrary`.
- **ArticleDetailPage** composes `useArticleDetail` (article + one-shot
  view-count bump + related), `useArticleComments` + `useCommentComposer`,
  `useSupabase` (current user id for comment ownership) and `useArticleNavigation`.
  Reuses `ArticleHeader`, `ArticleContent`, `ReaderToolbar`/`ReaderSettingsPanel`
  (inside `ReaderSettingsProvider`), `CommentComposer`, `CommentList`,
  `ArticleList` (related), and the shared `copyTextToClipboard` (Share falls
  back to copy). The whole page is wrapped in `ReaderSettingsProvider` (the
  header toolbar + body share the context).
- **AddEditArticlePage** composes ONLY `useArticleEditor` + the existing
  editor pieces (`ArticleEditor`, `ImageUploader`, `FeaturedImage`,
  `SaveIndicator`, `PreviewPanel`) + `CategorySelector` + shared
  `DiscardChangesDialog`. It contains NO editor/HTML⇄Delta/upload/autosave
  logic — those live in the editor platform + the editor hook. The admin gate
  mirrors the Songs editor. Wrapped in `ReaderSettingsProvider` (the preview's
  `ArticleContent` needs it).
- **ArticleRouteDispatcher** picks the page from `parseArticlePath` and
  consumes the one-shot `pendingTarget`. **The Add/Edit page is lazy-loaded
  with `ssr:false`** — `quill` touches `document` at module load, so it must
  never be evaluated in the server bundle (the list/detail pages stay fully
  server-rendered).
- **Supporting additions**: `queries/use-profile.ts` (`useCurrentProfile` via
  the shared `ProfileService` + `articlesKeys.profile`) so `useArticleLibrary`
  can expose `canManage`; `EditorToolbar` dropped the inert `ql-undo`/`ql-redo`
  buttons (Quill 2 has no toolbar undo/redo handlers → they'd log warnings and
  stay dead; undo/redo works natively via Ctrl/Cmd+Z / Ctrl/Cmd+Shift+Z);
  `useArticleEditor` now starts a FRESH empty draft on create (replacing a
  stale draft from a previous article, but keeping a persisted NEW draft for
  refresh-restore).
- **Verified**: lint + build PASS; browser at /articles (real list, category
  deep link `?category=prayer`, search bar, load-more), /articles/{id}
  (sanitized content, reader toolbar/settings, comments + sign-in gate,
  related articles, view-count 9→10 optimistic bump, back/forward, refresh),
  /articles/new + /articles/edit/{id} (admin gate when signed out; with the
  gate temporarily bypassed the editor composes: Quill editor + toolbar +
  title/excerpt/category/featured-image/published + SaveIndicator + advanced
  toolbar toggle + PreviewPanel + draft autosave/persist/restore). No pages
  query Supabase directly, no Delta/Quill imports outside the editor platform
  (+ its `ArticleEditor` wrapper), no cross-feature imports (grep clean).
