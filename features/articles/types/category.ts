/**
 * Article category — a direct port of the Flutter `ArticleCategory` enum
 * (`lib/helpers/article_category_enum.dart`). The app's article UI uses this
 * hardcoded enum (the separate `article_categories` table + `ArticleCategoryModel`
 * exist in Flutter but are DEAD code — no UI consumes them; see the
 * architecture README).
 *
 * The human-readable labels live in `features/articles/constants/categories.ts`
 * (a plain data map) so this module stays types-only, mirroring the Music
 * feature's `types/category.ts` vs `utils/category.ts` split.
 */
export type ArticleCategory =
  | "devotion"
  | "bibleStudy"
  | "theology"
  | "prayer"
  | "christianLiving"
  | "churchHistory"
  | "apologetics"
  | "missions"
  | "testimony"
  | "youth"
  | "family"
  | "leadership"
  | "news"
  | "other";

/**
 * The dead Flutter `ArticleCategoryModel` (`lib/models/article_categories.dart`,
 * `article_categories` table: id/name/slug + full CRUD) — retained as a type
 * only for documentation. NOT used by the current architecture (the UI uses
 * `ArticleCategory`); its admin category-management methods are out of scope.
 */
export interface ArticleCategoryRow {
  id: string;
  name: string;
  slug: string;
}
