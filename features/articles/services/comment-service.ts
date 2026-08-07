import type { SupabaseClient } from "@supabase/supabase-js";
import { unwrap } from "@/services/helpers";
import type { ArticleComment, ArticleCommentInput } from "../types";

/**
 * Comment service — a direct port of the SupabaseRepository comment methods
 * (`fetchArticleComments`, `insertArticleComment`, `updateArticleComment`,
 * `deleteArticleComment`, `fetchArticleCommentsPagination`) from
 * `lib/providers/supabase/supabase_repository_provider.dart`. Uses the existing
 * `article_comments` table with no schema changes.
 *
 * - Only `status === "approved"` comments are fetched (Flutter filters on
 *   `eq('status', 'approved')`); the row's `status` column defaults to
 *   "approved" on insert (a DB default — Flutter never sets it).
 * - Nested replies are NOT supported: Flutter has no `parent_id` column and
 *   no reply flow, so none is added here.
 * - Ownership is enforced by Supabase RLS (as in Flutter — the repo never
 *   re-checks ownership). The returned `userId` lets the UI show the
 *   "edit/delete my comment" affordance (`comment.userId === currentUser.id`).
 */

export interface CommentService {
  /** Approved comments for an article, newest first (replaces `fetchArticleComments`). */
  getArticleComments(articleId: string): Promise<ArticleComment[]>;
  /** Paginated approved comments, oldest first (replaces `fetchArticleCommentsPagination`). */
  getArticleCommentsPagination(
    articleId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<ArticleComment[]>;
  /**
   * Insert a comment (replaces `insertArticleComment`). Requires a signed-in
   * user — throws "User not authenticated" like the Flutter repo.
   */
  insertArticleComment(
    articleId: string,
    input: ArticleCommentInput,
  ): Promise<ArticleComment>;
  /** Edit a comment, marking it edited (replaces `updateArticleComment`). */
  updateArticleComment(commentId: string, content: string): Promise<ArticleComment>;
  /** Delete a comment (replaces `deleteArticleComment`). */
  deleteArticleComment(commentId: string): Promise<void>;
}

/** An `article_comments` row as returned by Supabase (snake_case columns). */
interface CommentRow {
  id: string;
  article_id: string;
  user_id: string | null;
  author_name: string | null;
  content: string;
  is_anonymous: boolean | null;
  is_edited: boolean | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

/** Maps an `article_comments` row to the domain `ArticleComment` (mirrors `fromJson`). */
export function mapComment(row: CommentRow): ArticleComment {
  return {
    id: row.id,
    articleId: row.article_id,
    userId: row.user_id ?? undefined,
    authorName: row.author_name ?? undefined,
    content: row.content,
    isAnonymous: row.is_anonymous ?? false,
    isEdited: row.is_edited ?? false,
    status: row.status ?? "approved",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseCommentService implements CommentService {
  constructor(private readonly client: SupabaseClient) {}

  async getArticleComments(articleId: string): Promise<ArticleComment[]> {
    const response = await this.client
      .from("article_comments")
      .select()
      .eq("article_id", articleId)
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    const rows = unwrap(response) as CommentRow[] | null;
    return (rows ?? []).map(mapComment);
  }

  async getArticleCommentsPagination(
    articleId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<ArticleComment[]> {
    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;
    const response = await this.client
      .from("article_comments")
      .select()
      .eq("article_id", articleId)
      .eq("status", "approved")
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);
    const rows = unwrap(response) as CommentRow[] | null;
    return (rows ?? []).map(mapComment);
  }

  async insertArticleComment(
    articleId: string,
    input: ArticleCommentInput,
  ): Promise<ArticleComment> {
    // Flutter used `_client.auth.currentUser`; the web reads the session.
    const { data } = await this.client.auth.getSession();
    const user = data.session?.user;
    if (!user) throw new Error("User not authenticated");
    const response = await this.client
      .from("article_comments")
      .insert({
        article_id: articleId,
        user_id: user.id,
        content: input.content,
        author_name: input.authorName,
        is_anonymous: input.isAnonymous ?? false,
      })
      .select()
      .single();
    const row = unwrap(response) as CommentRow;
    return mapComment(row);
  }

  async updateArticleComment(
    commentId: string,
    content: string,
  ): Promise<ArticleComment> {
    const response = await this.client
      .from("article_comments")
      .update({ content, is_edited: true })
      .eq("id", commentId)
      .select()
      .single();
    const row = unwrap(response) as CommentRow;
    return mapComment(row);
  }

  async deleteArticleComment(commentId: string): Promise<void> {
    const response = await this.client
      .from("article_comments")
      .delete()
      .eq("id", commentId);
    unwrap(response);
  }
}
