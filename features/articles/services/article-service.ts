import type { SupabaseClient } from "@supabase/supabase-js";
import { unwrap } from "@/services/helpers";
import type { UploadService } from "@/services/upload-service";
import { mediaPathFromUrl } from "@/utils/media";
import { articleCategoryFromString } from "../constants";
import type { Article, ArticleCategory } from "../types";

/**
 * Article service — a direct port of the SupabaseRepository article methods
 * (`fetchArticles`, `createArticle`, `updateArticle`, `deleteArticle`,
 * `fetchArticle`, `incrementViewCount`, `searchArticles`,
 * `fetchArticlesByCategory`) from
 * `lib/providers/supabase/supabase_repository_provider.dart`. Uses the existing
 * `articles` table with no schema changes.
 *
 * NOTE: Flutter's repo also has `article_categories` CRUD
 * (`fetchCategories`/`createCategory`/`updateCategory`/`deleteCategory`) —
 * those are DEAD code with no UI, and the `article_categories` table does NOT
 * exist in the deployed backend (confirmed: PGRST205 "Could not find the
 * table"). Categories are instead a free-text `category` column on `articles`
 * (values like `faith`, `holySpirit`, `End Times` that the `ArticleCategory`
 * enum doesn't include → `articleCategoryFromString` falls back to "other",
 * exactly like Flutter's `ArticleCategory.fromString`). Those methods are
 * therefore NOT ported — porting them would yield runtime-failing dead code.
 *
 * CONTENT FORMAT: `articles.content` is stored as **HTML** (the canonical
 * article format). This service reads and writes the `content` column as a
 * plain HTML string and is completely editor-agnostic — it never sees Quill
 * Delta JSON and never touches the editor. Whether the HTML was produced by
 * Quill or another editor is outside this service's responsibility.
 *
 * The featured-image cleanup on delete reuses the SHARED `UploadService`
 * (`delete-file` edge function) + the SHARED `mediaPathFromUrl` helper — no
 * duplicated upload/delete logic.
 */

export interface ArticleService {
  /** Paginated articles, newest first (replaces `fetchArticles`). */
  getArticles(options: { limit: number; offset: number }): Promise<Article[]>;
  /** A single article by id (replaces `fetchArticle`). */
  getArticle(id: string): Promise<Article | null>;
  /** Paginated articles in a category, newest first (replaces `fetchArticlesByCategory`). */
  getArticlesByCategory(
    category: ArticleCategory,
    options?: { limit?: number; offset?: number },
  ): Promise<Article[]>;
  /**
   * Published articles tied to a Bible chapter — reuses the EXISTING
   * `related_book_number`/`related_chapter` columns (web-first internal
   * linking: the Bible reader surfaces "related articles" for the open
   * chapter). No schema change.
   */
  getArticlesByRelatedChapter(
    bookNumber: number,
    chapter: number,
    options?: { limit?: number },
  ): Promise<Article[]>;
  /** Title search (replaces `searchArticles`; no Flutter UI uses it). */
  searchArticles(
    query: string,
    options?: { limit?: number },
  ): Promise<Article[]>;
  /** Insert an article row and return it (replaces `createArticle`). */
  createArticle(article: Article): Promise<Article>;
  /** Update an article row (sets `updated_at`) and return it (replaces `updateArticle`). */
  updateArticle(article: Article): Promise<Article>;
  /**
   * Delete an article row (replaces `deleteArticle`), then best-effort deletes
   * the featured-image file via the shared `UploadService` (Flutter's
   * `ArticlesNotifier.deleteImageFile`).
   */
  deleteArticle(article: Article): Promise<void>;
  /** Bump `view_count` to `currentCount + 1` (replaces `incrementViewCount`). */
  incrementViewCount(id: string, currentCount: number): Promise<void>;
}

/** An `articles` row as returned by Supabase (snake_case columns). */
interface ArticleRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  category: string | null;
  author_name: string | null;
  source_url: string | null;
  language_code: string | null;
  featured: boolean | null;
  published: boolean | null;
  view_count: number | null;
  comment_count: number | null;
  reading_time: number | null;
  related_book_number: number | null;
  related_chapter: number | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

/** Maps an `articles` row to the domain `Article` (mirrors `Article.fromJson`). */
export function mapArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? undefined,
    // `content` is the stored HTML string — passed through untouched.
    content: row.content ?? "",
    featuredImage: row.featured_image ?? undefined,
    category: articleCategoryFromString(row.category),
    authorName: row.author_name ?? undefined,
    sourceUrl: row.source_url ?? undefined,
    languageCode: row.language_code ?? "en",
    featured: row.featured ?? false,
    published: row.published ?? true,
    viewCount: row.view_count ?? 0,
    commentCount: row.comment_count ?? 0,
    readingTime: row.reading_time ?? undefined,
    relatedBookNumber: row.related_book_number ?? undefined,
    relatedChapter: row.related_chapter ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at ?? undefined,
  };
}

/** Maps a domain `Article` to the snake_case insert payload (mirrors `toJson`). */
function toArticleRow(article: Article): Record<string, unknown> {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt ?? null,
    content: article.content,
    featured_image: article.featuredImage ?? null,
    category: article.category,
    author_name: article.authorName ?? null,
    source_url: article.sourceUrl ?? null,
    language_code: article.languageCode,
    featured: article.featured,
    published: article.published,
    view_count: article.viewCount,
    comment_count: article.commentCount,
    reading_time: article.readingTime ?? null,
    related_book_number: article.relatedBookNumber ?? null,
    related_chapter: article.relatedChapter ?? null,
    created_at: article.createdAt,
    updated_at: article.updatedAt,
    published_at: article.publishedAt ?? null,
  };
}

export class SupabaseArticleService implements ArticleService {
  /**
   * @param client The shared Supabase client.
   * @param upload The SHARED `UploadService` (same client), used only for the
   * best-effort featured-image file delete on article delete.
   */
  constructor(
    private readonly client: SupabaseClient,
    private readonly upload: UploadService,
  ) {}

  async getArticles(options: {
    limit: number;
    offset: number;
  }): Promise<Article[]> {
    const response = await this.client
      .from("articles")
      .select()
      .order("created_at", { ascending: false })
      .range(options.offset, options.offset + options.limit - 1);
    const rows = unwrap(response) as ArticleRow[] | null;
    return (rows ?? []).map(mapArticle);
  }

  async getArticle(id: string): Promise<Article | null> {
    const response = await this.client
      .from("articles")
      .select()
      .eq("id", id)
      .maybeSingle();
    const row = unwrap(response) as ArticleRow | null;
    return row ? mapArticle(row) : null;
  }

  async getArticlesByCategory(
    category: ArticleCategory,
    options?: { limit?: number; offset?: number },
  ): Promise<Article[]> {
    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;
    const response = await this.client
      .from("articles")
      .select()
      .eq("category", category)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    const rows = unwrap(response) as ArticleRow[] | null;
    return (rows ?? []).map(mapArticle);
  }

  async getArticlesByRelatedChapter(
    bookNumber: number,
    chapter: number,
    options?: { limit?: number },
  ): Promise<Article[]> {
    const response = await this.client
      .from("articles")
      .select()
      .eq("related_book_number", bookNumber)
      .eq("related_chapter", chapter)
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(options?.limit ?? 4);
    const rows = unwrap(response) as ArticleRow[] | null;
    return (rows ?? []).map(mapArticle);
  }

  async searchArticles(
    query: string,
    options?: { limit?: number },
  ): Promise<Article[]> {
    const response = await this.client
      .from("articles")
      .select()
      .ilike("title", `%${query}%`)
      .limit(options?.limit ?? 20);
    const rows = unwrap(response) as ArticleRow[] | null;
    return (rows ?? []).map(mapArticle);
  }

  async createArticle(article: Article): Promise<Article> {
    const response = await this.client
      .from("articles")
      .insert(toArticleRow(article))
      .select()
      .single();
    const row = unwrap(response) as ArticleRow;
    return mapArticle(row);
  }

  async updateArticle(article: Article): Promise<Article> {
    // Flutter updates `{...article.toJson(), updated_at: now}`; the immutable
    // primary key `id` is excluded from the SET clause (web refinement — the
    // Songs `updateAudio` does the same), and `updated_at` is stamped now.
    const { id: _id, ...payload } = toArticleRow(article);
    const response = await this.client
      .from("articles")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", article.id)
      .select()
      .single();
    const row = unwrap(response) as ArticleRow;
    return mapArticle(row);
  }

  async deleteArticle(article: Article): Promise<void> {
    const response = await this.client.from("articles").delete().eq("id", article.id);
    unwrap(response);
    // Best-effort featured-image file delete (Flutter `deleteImageFile`): the
    // shared `mediaPathFromUrl` extracts the storage path from the media URL,
    // then the shared `UploadService.deleteFile` removes the object.
    const path = mediaPathFromUrl(article.featuredImage);
    if (path) {
      try {
        await this.upload.deleteFile(path);
      } catch (error) {
        console.warn("Failed to delete featured image", error);
      }
    }
  }

  async incrementViewCount(id: string, currentCount: number): Promise<void> {
    // Faithful port of Flutter `incrementViewCount`: the caller supplies the
    // current count (the notifier already bumped it optimistically) and the
    // service writes `currentCount + 1` — no read-then-write race.
    const response = await this.client
      .from("articles")
      .update({ view_count: currentCount + 1 })
      .eq("id", id);
    unwrap(response);
  }
}
