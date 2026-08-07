# Articles services (implemented)

The data-access layer, mirroring the `BibleServices` / `MusicServices` /
`SongServices` aggregate pattern. All services share ONE `SupabaseClient`;
`unwrap` comes from the shared `@/services/helpers`.

- `services/article-service.ts` — `ArticleService` (articles + category
  filtering on the `articles.category` column).
- `services/comment-service.ts` — `CommentService` (article comments).
- `services/index.ts` — `ArticleServices { article, comment, upload, profile }`
  aggregate + `createArticleServices(client?)` / `getArticleServices()`.

## Service contracts

| Service / method | Replaces (Flutter `SupabaseRepository`) | Notes |
| --- | --- | --- |
| `ArticleService` | | `articles` table |
| `getArticles({limit, offset})` | `fetchArticles` | order `created_at desc`, `range(offset, offset+limit-1)` |
| `getArticle(id)` | `fetchArticle` | `.maybeSingle()` → `Article \| null` (web adaptation — Flutter `.single()` throws 406) |
| `getArticlesByCategory(category, {limit=20, offset=0})` | `fetchArticlesByCategory` | `eq('category', category)` — the web passes the `ArticleCategory` value directly (Flutter passed a dead `ArticleCategoryModel.slug`) |
| `searchArticles(query, {limit=20})` | `searchArticles` | `ilike('title', %q%)` (repo method, no Flutter UI) |
| `createArticle(article)` | `createArticle` | insert full row (HTML `content`) + `.select().single()` → returns the row |
| `updateArticle(article)` | `updateArticle` | update all fields + stamp `updated_at` now + `.select().single()` → returns the row |
| `deleteArticle(article)` | `deleteArticle` + `deleteImageFile` | row delete + best-effort featured-image file delete via the SHARED `UploadService` + `mediaPathFromUrl` |
| `incrementViewCount(id, currentCount)` | `incrementViewCount` | writes `view_count = currentCount + 1` (faithful — the caller supplies the current count) |
| `CommentService` | | `article_comments` table |
| `getArticleComments(articleId)` | `fetchArticleComments` | `eq status 'approved'`, order `created_at desc` |
| `getArticleCommentsPagination(articleId, {limit=20, offset=0})` | `fetchArticleCommentsPagination` | `eq status 'approved'`, order `created_at asc`, `range` |
| `insertArticleComment(articleId, input)` | `insertArticleComment` | requires an auth session — throws `"User not authenticated"` (Flutter message); `.select().single()` |
| `updateArticleComment(commentId, content)` | `updateArticleComment` | sets `is_edited: true`; `.select().single()` |
| `deleteArticleComment(commentId)` | `deleteArticleComment` | |

## Shared infrastructure reused (no feature-to-feature imports)

- **`unwrap`** — `@/services/helpers`.
- **`UploadService`** (`@/services/upload-service`) — `SupabaseArticleService`
  receives it in its constructor for the featured-image cleanup on delete;
  `ArticleServices.upload` also exposes it for admin uploads.
- **`ProfileService`** (`@/services/profile-service`) — exposed as
  `ArticleServices.profile`; `getProfileById` + the shared `canManage` rule
  (`@/types/profile`) drive the future admin/editor gating.
- **`mediaPathFromUrl`** (`@/utils/media`) — media URL → storage path for the
  delete cleanup.
- **`createClient`** (`@/lib/supabase/client`) — one shared browser client.

## Flutter behavior that cannot be ported exactly

- **`article_categories` CRUD NOT ported**: Flutter's repo has
  `fetchCategories`/`createCategory`/`updateCategory`/`deleteCategory`, but the
  `article_categories` table does NOT exist in the deployed backend (confirmed
  at runtime: PGRST205 "Could not find the table 'public.article_categories'").
  Categories are instead a free-text `category` column on `articles` (values
  like `faith`, `holySpirit`, `End Times`, `Bible Stud`, `Technology` that the
  `ArticleCategory` enum doesn't include → `articleCategoryFromString` falls
  back to "other", exactly like Flutter's `ArticleCategory.fromString`).
  Category LIST filtering is fully supported via `getArticlesByCategory`
  (filters `articles.category`); the table CRUD is omitted because porting it
  would produce runtime-failing dead code (no placeholder implementations).
- **`fetchArticle` (`.single()`)**: Flutter throws (PostgREST 406) when a row
  is missing. The web uses `.maybeSingle()` → `Article | null` (the established
  Songs/Bible pattern) so the detail page can show a clean "not found" state.
- **`updateArticle`**: Flutter sends the whole `toJson()` (including `id`). The
  web excludes the immutable primary key from the SET clause (mirrors the Songs
  `updateAudio`) but still stamps `updated_at`.
- **`incrementViewCount`**: identical to Flutter (param-based `currentCount`),
  NOT a read-then-write — so the query layer must pass the live count it holds.

## HTML is the canonical content format

`articles.content` is stored as **HTML**. Every ArticleService read/write passes
the `content` column through as a plain HTML string (`mapArticle` copies it
untouched; `createArticle`/`updateArticle` insert it as-is). The services are
completely editor-agnostic: no Quill Delta JSON is ever produced, parsed, or
persisted, and the DB schema is unchanged. (The Quill editor — a later phase —
converts Delta ⇄ HTML around these services; see `editor/README.md`.)
