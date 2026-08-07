import type { ArticleCategory } from "../types";

/**
 * React Query cache keys for Articles (mirrors `musicKeys` / `songsKeys`).
 *
 *   - `infinite()`      — the paginated library (`ArticlesNotifier` list).
 *   - `detail(id)`      — a single article (`ArticleByIdProvider` family).
 *   - `byCategory(cat)` — category-scoped list (`ArticlesWithCategoryNotifier`
 *                         — DEAD in Flutter, retained for parity/optional).
 *   - `search(query)`   — `searchArticles` (repo method; no Flutter UI — a
 *                         web refinement candidate).
 *   - `comments(id)`    — an article's approved comments
 *                         (`ArticleCommentsNotifier` family).
 */
export const articlesKeys = {
  all: () => ["articles"] as const,
  lists: () => ["articles", "list"] as const,
  infinite: () => ["articles", "list", "infinite"] as const,
  detail: (id: string) => ["articles", "detail", id] as const,
  byCategory: (category: ArticleCategory) =>
    ["articles", "category", category] as const,
  search: (query: string) => ["articles", "search", query] as const,
  comments: (articleId: string) => ["articles", "comments", articleId] as const,
  profile: (userId: string) => ["articles", "profile", userId] as const,
};
