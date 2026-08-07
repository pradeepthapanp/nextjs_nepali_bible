/**
 * ArticleComment — a direct port of the Flutter `ArticleComment` model
 * (`lib/models/article_comment.dart`, Supabase `article_comments` table).
 *
 * Column mapping: id, article_id → articleId, user_id → userId,
 * author_name → authorName, content, is_anonymous → isAnonymous,
 * is_edited → isEdited, status, created_at → createdAt, updated_at → updatedAt.
 *
 * Only `status === "approved"` comments are fetched (Flutter filters on
 * `eq('status', 'approved')`). `userId === current user id` drives the
 * "delete my comment" affordance.
 */
export interface ArticleComment {
  id: string;
  articleId: string;
  userId?: string;
  authorName?: string;
  content: string;
  isAnonymous: boolean;
  isEdited: boolean;
  /** Comment moderation status; only "approved" is surfaced. */
  status: string;
  createdAt: string;
  updatedAt: string;
}

/** The input for adding a comment (Flutter `insertArticleComment` args). */
export interface ArticleCommentInput {
  content: string;
  isAnonymous?: boolean;
  authorName: string;
}
