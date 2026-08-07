# Articles queries (implemented)

The React Query layer, keyed on `query-keys.ts` (`articlesKeys`). Mirrors the
Bible/Music/Online Songs query patterns: server state lives in the cache (no
Zustand), every call goes through the shared `ArticleServices` (never Supabase
directly), and mutations are optimistic-or-network-first per the Flutter
notifier semantics.

- `queries/use-articles.ts` — article queries.
- `queries/use-article-mutations.ts` — article mutations.
- `queries/use-comments.ts` — comment query + comment mutations.

## Queries

| Hook | Replaces (Flutter) | Cache key | Notes |
| --- | --- | --- | --- |
| `useArticles()` | `ArticlesNotifier.build` (first page) | `articlesKeys.lists()` | finite single-shot, page `ARTICLE_PAGE_SIZE` |
| `useInfiniteArticles()` | `ArticlesNotifier.build/loadMore` | `articlesKeys.infinite()` | page 10, `hasMore` on a full page, `placeholderData: previous` |
| `useArticle(id?)` | `articleByIdProvider` (family) | `articlesKeys.detail(id)` | `enabled` once an id is known → `Article \| null` |
| `useArticlesByCategory(category)` | `ArticlesWithCategoryNotifier` (dead) | `articlesKeys.byCategory(cat)` | first page, `ARTICLE_CATEGORY_PAGE_SIZE` |
| `useRelatedArticlesQuery(article?)` | — (web-first; Flutter has none) | `articlesKeys.byCategory(cat)` | reuses the SAME category cache (no dup fetch), slices `RELATED_ARTICLES_LIMIT` excluding self. Named `…Query` so the behavior hook `useRelatedArticles` (in `hooks/`) owns the public name without a barrel collision |
| `useSearchArticles(query)` | `searchArticles` (repo, no Flutter UI) | `articlesKeys.search(q)` | `enabled` on non-empty query, `ARTICLE_SEARCH_LIMIT` |
| `useArticleComments(articleId?)` | `ArticleCommentsNotifier` family | `articlesKeys.comments(id)` | approved comments, newest first |

`flattenArticlePages(data)` flattens the infinite pages (consumers never touch
`pages`).

## Mutations

| Hook | Replaces (Flutter) | Strategy | Invalidation |
| --- | --- | --- | --- |
| `useCreateArticle()` | `ArticlesNotifier.createArticle` | **network-first** (server row prepended to list + detail on success) | `lists()` (prefix → covers finite + infinite) + `byCategory(category)` |
| `useUpdateArticle()` | `ArticlesNotifier.updateArticle` | **network-first** (server row mapped in place on success) | `lists()` + `detail(id)` + `byCategory(new)` + `byCategory(old)` when the category changed |
| `useDeleteArticle()` | `ArticlesNotifier.deleteArticle` | **optimistic** (removed + detail dropped, rollback on error) | `lists()` + `byCategory(category)` |
| `useIncrementViewCount()` | `ArticlesNotifier.incrementViewCount` | **optimistic** +1 in list + detail | `lists()` on error |
| `useCreateComment()` | `ArticleCommentsNotifier.addComment` | **network-first** (row prepended, no refetch) | none (prepend is authoritative — newest first) |
| `useUpdateComment()` | `ArticleCommentsNotifier.updateComment` | **optimistic** (content + `isEdited:true` in place, rollback) | `comments(articleId)` |
| `useDeleteComment()` | `ArticleCommentsNotifier.deleteComment` | **optimistic** (removed, rollback) | `comments(articleId)` |

## Cache-invalidation strategy (targeted)

- `articlesKeys.lists()` is a PREFIX of `articlesKeys.infinite()`
  (`["articles","list"]` ⊂ `["articles","list","infinite"]`), so one
  `invalidateQueries({ queryKey: articlesKeys.lists() })` refreshes BOTH the
  finite `useArticles` and the infinite `useInfiniteArticles`.
- Article mutations also invalidate the article's category list
  (`byCategory`) — a created/updated/deleted article changes it. Update reads
  the pre-mutation article from the detail cache (`onMutate`) to ALSO
  invalidate the OLD category when the category changed.
- Comment mutations invalidate ONLY `comments(articleId)` — never another
  article's comments and never the article lists (a comment doesn't change
  list membership). The detail's `commentCount` is intentionally NOT bumped
  here (Flutter never recomputes it either); it's reconciled by refetching the
  detail when it's shown.
- Search / related caches are NOT invalidated by mutations — they are
  optional/derived surfaces; a fresh search refetches when the user searches.

## Optimistic-update strategy

- **Network-first** (create/update article, create comment): the service
  returns the authoritative server row, so the cache is written from that row
  on `onSuccess` — no temp-id dance, no rollback needed.
- **Optimistic** (delete article, increment view count, update/delete comment):
  `onMutate` snapshots the affected cache (list pages for the infinite list,
  the comment array), writes the optimistic state, and `onError` restores the
  snapshot; `onSettled` invalidates to reconcile with the server.
- The featured-image file cleanup on article delete lives in the SHARED
  `ArticleService.deleteArticle` (not duplicated in the mutation).

## Scope

Queries + mutations only. No Zustand, no behavior `hooks/`, no pages, no UI,
no editor. The `useCurrentProfile` admin gate (shared `ProfileService` +
`canManage`) is a separate contract — it arrives with the hooks/UI phase.
