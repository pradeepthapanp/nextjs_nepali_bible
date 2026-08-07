import type { ArticleCategory } from "./category";

/**
 * Article — a direct port of the Flutter `Article` model
 * (`lib/models/article.dart`, Supabase `articles` table).
 *
 * Column mapping (snake_case → camelCase):
 *   id, title, slug, excerpt, content, featured_image → featuredImage,
 *   category, author_name → authorName, source_url → sourceUrl,
 *   language_code → languageCode, featured, published,
 *   view_count → viewCount, comment_count → commentCount,
 *   reading_time → readingTime, related_book_number → relatedBookNumber,
 *   related_chapter → relatedChapter, created_at → createdAt,
 *   updated_at → updatedAt, published_at → publishedAt.
 *
 * `content` is STORED AS HTML (Quill Delta converted to HTML on save, and
 * HTML → Delta on load in the editor). The reader renders it sanitized; see
 * `features/articles/editor/README.md` for the Quill/Delta decision.
 */
export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  /** HTML content (Quill Delta → HTML); rendered sanitized. */
  content: string;
  featuredImage?: string;
  category: ArticleCategory;
  authorName?: string;
  sourceUrl?: string;
  languageCode: string;
  featured: boolean;
  published: boolean;
  viewCount: number;
  commentCount: number;
  readingTime?: number;
  /** Optional bible reference the article is tied to (no related-articles UI in Flutter). */
  relatedBookNumber?: number;
  relatedChapter?: number;
  /** ISO timestamp. */
  createdAt: string;
  /** ISO timestamp. */
  updatedAt: string;
  /** ISO timestamp; undefined while still a draft. */
  publishedAt?: string;
}

/**
 * The payload for create/update (draft/publish + content). Omits server- and
 * id-derived fields (`id`, `viewCount`, `commentCount`, `createdAt`,
 * `updatedAt`, `publishedAt`) which the service/queries manage.
 */
export interface ArticleInput {
  title: string;
  slug: string;
  excerpt?: string;
  /** HTML content produced by the Quill Delta → HTML converter. */
  content: string;
  featuredImage?: string;
  category: ArticleCategory;
  authorName?: string;
  sourceUrl?: string;
  languageCode?: string;
  featured?: boolean;
  /** Draft = false, Publish = true (Flutter's `published` checkbox). */
  published: boolean;
  readingTime?: number;
  relatedBookNumber?: number;
  relatedChapter?: number;
}
