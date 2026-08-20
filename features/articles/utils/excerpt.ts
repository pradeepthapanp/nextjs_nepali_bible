/**
 * Article excerpt helper — derives an excerpt from EXISTING article content
 * only (the stored HTML `content` body). Never invents text. Pure +
 * framework-free (server + client safe).
 */
import {
  firstSentences,
  SEO_EXCERPT_MAX,
  stripMarkup,
} from "@/lib/seo-text";
import type { Article } from "../types";

/**
 * Generates an article excerpt:
 *   1. uses the article's stored `excerpt` when present (normalized);
 *   2. otherwise strips the HTML body and takes its first 1–2 sentences
 *      (≤ ~200 chars) — a faithful summary of the existing content.
 * The excerpt is derived, not invented: it quotes the article's own body.
 */
export function deriveArticleExcerpt(
  article: Pick<Article, "title" | "excerpt" | "content">,
): string {
  const stored = article.excerpt?.trim();
  if (stored) return stored;

  const plain = stripMarkup(article.content ?? "");
  const summary = firstSentences(plain, 2, SEO_EXCERPT_MAX);
  if (summary) return summary;

  // No body — fall back to the title (existing content, never invented).
  return article.title?.trim() ?? "";
}
