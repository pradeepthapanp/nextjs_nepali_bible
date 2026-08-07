/**
 * Pagination constants — direct ports of the Flutter notifier page sizes.
 */
export const ARTICLE_PAGE_SIZE = 10; // `ArticlesNotifier._pageSize` (articles list)
export const ARTICLE_CATEGORY_PAGE_SIZE = 20; // `ArticlesWithCategoryNotifier._pageSize` (dead page)
export const ARTICLE_COMMENT_PAGE_SIZE = 20; // `fetchArticleCommentsPagination` limit
export const ARTICLE_SEARCH_LIMIT = 20; // `searchArticles` limit (repo method, no Flutter UI)
/** Search debounce (ms) — direct port of the Flutter 400ms `Debouncer`. */
export const ARTICLE_SEARCH_DEBOUNCE_MS = 400;
/** Web-first: how many related articles `useRelatedArticles` shows (Flutter has none). */
export const RELATED_ARTICLES_LIMIT = 4;
