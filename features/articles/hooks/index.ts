/**
 * Barrel for the Articles feature behavior hooks.
 *
 *   use-article-library.ts          — paginated library + category filter + delete
 *   use-article-detail.ts           — article query + view-count bump + related
 *   use-article-search.ts           — debounced search (input → React Query)
 *   use-article-filters.ts          — category filter store wrapper
 *   use-article-reader-settings.ts  — reader preferences store wrapper
 *   use-comment-composer.ts         — comment draft + submit/update/remove
 *   use-article-editor.ts           — editor draft/autosave + save + image upload
 *   use-article-navigation.ts       — deep links + pending navigation
 *   use-related-articles.ts         — related-articles behavior (composes query)
 */

export * from "./use-article-library";
export * from "./use-article-detail";
export * from "./use-article-search";
export * from "./use-article-filters";
export * from "./use-article-reader-settings";
export * from "./use-comment-composer";
export * from "./use-article-editor";
export * from "./use-article-navigation";
export * from "./use-related-articles";
