/**
 * URL slug generation — the web replacement of Flutter's
 * `_AddEditArticlePageState.generateSlug`
 * (`lib/articles/add_edit_article_page.dart`), used by the editor hook when
 * creating a new article: lowercase, strip anything outside `[a-z0-9\s-]`,
 * collapse whitespace to `-`, collapse runs of `-`, and trim leading/trailing
 * `-`. Pure and framework-free.
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
