import type { ArticleCategory } from "../types";

/**
 * Category labels — a direct port of the Flutter `ArticleCategory.label` getter
 * (`lib/helpers/article_category_enum.dart`). A plain data map so `types/`
 * stays types-only.
 */
export const ARTICLE_CATEGORY_LABELS: Record<ArticleCategory, string> = {
  devotion: "Devotion",
  bibleStudy: "Bible Study",
  theology: "Theology",
  prayer: "Prayer",
  christianLiving: "Christian Living",
  churchHistory: "Church History",
  apologetics: "Apologetics",
  missions: "Missions",
  testimony: "Testimony",
  youth: "Youth",
  family: "Family",
  leadership: "Leadership",
  news: "News",
  other: "Other",
};

/** The display order for category pickers/chips (Flutter enum order). */
export const ARTICLE_CATEGORY_ORDER: readonly ArticleCategory[] = [
  "devotion",
  "bibleStudy",
  "theology",
  "prayer",
  "christianLiving",
  "churchHistory",
  "apologetics",
  "missions",
  "testimony",
  "youth",
  "family",
  "leadership",
  "news",
  "other",
];

/** The editor's default category (Flutter `_category ?? ArticleCategory.devotion`). */
export const DEFAULT_ARTICLE_CATEGORY: ArticleCategory = "devotion";

/**
 * Safe category parsing — the web replacement of `ArticleCategory.fromString`
 * (falls back to "other" for unknown values, mirroring Flutter's `orElse`).
 * Kept as a pure util contract here; the implementation lands in `utils/`.
 */
export function articleCategoryFromString(value: string | null | undefined): ArticleCategory {
  return ARTICLE_CATEGORY_ORDER.includes(value as ArticleCategory)
    ? (value as ArticleCategory)
    : "other";
}
