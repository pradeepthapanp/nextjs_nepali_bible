# Articles store (implemented)

Client-only UI state via Zustand — the web equivalent of what Flutter keeps in
controller/`State` (the Flutter Articles feature has no Riverpod UI store; all
server data lives in notifiers → React Query on the web). Server data NEVER
lives here — no `Article[]`, no `Comment[]`, no duplicate of any React Query
cache.

## Stores

| Store | Purpose | Flutter source | Persisted? |
| --- | --- | --- | --- |
| `useArticleFilterStore` | selected category chip (`"all"` | category) for the list page | — (web refinement; Flutter list has no filter) | no |
| `useArticleSearchStore` | search `query` + `isSearching` flag | `searchArticles` (repo, no Flutter UI — web refinement) | no |
| `useArticleReaderSettingsStore` | reader font size / line height / paragraph spacing / font family / alignment / theme | `settingsProvider` (the generic subset `ArticleDetailsPage` reads) | **yes** — `articles.reader-settings` |
| `useCommentComposerStore` | comment draft text + `isAnonymous` + `isSending` | `_ArticleCommentsSectionState` | no |
| `useArticleEditorStore` | editor draft (title/excerpt/HTML/category/published/featuredImage) + autosave bookkeeping | `_AddEditArticlePageState` (`_hasChanges`) | **yes** — `articles.draft` (draft only via `partialize`) |
| `useArticleNavigationStore` | pending navigation target (article / category), one-shot `consumePendingTarget` | `go_router` route objects (MusicLanded-style) | no |

## Persisted fields

- **`useArticleReaderSettingsStore`** → `articles.reader-settings`
  (`localStorage`): `fontSize`, `lineHeight`, `paragraphSpacing`, `fontFamily`,
  `alignment`, `theme`. Setters clamp to the shared ranges; `reset` restores
  defaults; `merge` over defaults + `version: 1` (the standard convention).
  The font list is the SHARED `@/utils/fonts` (`APP_FONT_FAMILIES`).
- **`useArticleEditorStore`** → `articles.draft` (`localStorage`): the pending
  `draft` (title / excerpt / HTML `content` / category / published /
  featuredImage). `partialize` persists ONLY `draft` — the `autosave`
  (dirty/lastSavedAt) bookkeeping is transient, so a restored draft starts
  clean. Editor-agnostic: `content` is stored as HTML.

## Non-persisted fields

Everything else is transient UI and does NOT survive restarts (per
"do not persist temporary dialog state"): filter chip, search query/
isSearching, comment draft/anonymity/sending, pending navigation target, and
the editor's autosave dirty/lastSavedAt flags.

## Why Zustand, not React Query

- These are **UI-only** values — the reader/filter/search/navigation/edit form
  surfaces need synchronous, shared client state that must NOT be stored as
  server data or trigger refetches.
- Server data (articles, comments, search results) stays in React Query
  (`articlesKeys`); the stores only hold the *view parameters* that shape how
  that data is presented or which draft is in progress. Persisted reading
  preferences and the autosave draft are client-side (like Flutter's
  `SharedPreferences`), not backend state.

## Conventions

- Hook names `use<Name>Store` (avoid colliding with the future behavior hooks).
- Persisted stores use `persist(createJSONStorage(() => localStorage), …)` with
  `merge` over defaults + `version` (the Music/Bible convention).
- No store imports queries/services — none of them touch Supabase or React Query
  state.
