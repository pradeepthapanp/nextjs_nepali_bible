import { Suspense } from "react";
import { ArticleRouteDispatcher } from "@/features/articles/components/article-route-dispatcher";

/**
 * Articles route — the mount point for the Articles section.
 *
 * A single optional catch-all covers every deep-link shape handled by
 * `parseArticlePath`:
 *   /articles             → list (category `?category=` deep link)
 *   /articles/{id}        → article detail
 *   /articles/new         → create editor
 *   /articles/edit/{id}   → edit editor
 * `ArticleRouteDispatcher` picks the page from the path; each page reads its
 * own params/data, so this page stays a thin server shell.
 * `Suspense` is required because `ArticleListPage` uses `useSearchParams`
 * (for the `?category=` deep link) and this page is prerendered.
 */
export default function ArticlesPage() {
  return (
    <Suspense fallback={null}>
      <ArticleRouteDispatcher />
    </Suspense>
  );
}
