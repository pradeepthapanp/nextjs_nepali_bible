import type { Metadata } from "next";
import { Suspense } from "react";
import { ArticleRouteDispatcher } from "@/features/articles/components/article-route-dispatcher";
import { createArticleServices } from "@/features/articles/services";
import { JsonLd } from "@/components/json-ld";
import {
  articleGraph,
  breadcrumbListGraph,
  collectionPageGraph,
  type JsonLdGraph,
} from "@/lib/json-ld";
import { createClient } from "@/lib/supabase/server";
import { pageDescriptions, seo } from "@/lib/seo";

/**
 * Article path shape (mirrors `parseArticlePath` in the "use client" hook
 * module — inlined here because server components cannot import it):
 *   /articles           → list
 *   /articles/new       → create
 *   /articles/edit/{id} → edit
 *   /articles/{id}      → detail
 */
function parseArticlePath(pathname: string):
  | { kind: "list" }
  | { kind: "article"; articleId: string }
  | { kind: "new" }
  | { kind: "edit"; articleId: string } {
  if (pathname === "/articles" || pathname === "/articles/") return { kind: "list" };
  if (pathname === "/articles/new") return { kind: "new" };
  const edit = /^\/articles\/edit\/([^/]+)$/.exec(pathname);
  if (edit) return { kind: "edit", articleId: edit[1] };
  const article = /^\/articles\/([^/]+)$/.exec(pathname);
  if (article) return { kind: "article", articleId: article[1] };
  return { kind: "list" };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}): Promise<Metadata> {
  const { segments = [] } = await params;
  const pathname = `/articles/${segments.join("/")}`;
  const link = parseArticlePath(pathname);

  if (link.kind === "article") {
    const path = `/articles/${link.articleId}`;
    try {
      const services = createArticleServices(await createClient());
      const article = await services.article.getArticle(link.articleId);
      if (article?.title) {
        return seo({
          title: article.title,
          description: article.excerpt || article.title,
          keywords: article.category ? [article.category] : undefined,
          path,
        });
      }
    } catch {
      // Fall through to a generic Article title.
    }
    return seo({ title: "Article", description: pageDescriptions.articles, path });
  }

  if (link.kind === "new" || link.kind === "edit") {
    return seo({
      title: link.kind === "new" ? "New Article" : "Edit Article",
      path: pathname,
      noindex: true,
    });
  }

  return seo({ title: "Articles", description: pageDescriptions.articles, path: "/articles" });
}

/** Article structured data for the detail page / CollectionPage for the list. */
async function articleJsonLd(
  segments: string[],
): Promise<JsonLdGraph[] | null> {
  const pathname = `/articles/${segments.join("/")}`;
  const link = parseArticlePath(pathname);

  if (link.kind === "article") {
    const path = `/articles/${link.articleId}`;
    try {
      const services = createArticleServices(await createClient());
      const article = await services.article.getArticle(link.articleId);
      if (article?.title) {
        return [
          articleGraph({
            headline: article.title,
            description: article.excerpt || article.title,
            path,
            datePublished: article.publishedAt ?? article.createdAt,
            author: article.authorName,
            keywords: article.category ? [article.category] : undefined,
          }),
          breadcrumbListGraph([
            { name: "Articles", path: "/articles" },
            { name: article.title, path },
          ]),
        ];
      }
    } catch {
      // Fall through — no structured data for an unresolvable article.
    }
    return null;
  }

  if (link.kind === "list") {
    return [
      collectionPageGraph({
        title: "Articles",
        description: pageDescriptions.articles,
        path: "/articles",
      }),
    ];
  }

  return null; // new / edit — admin forms.
}

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
export default async function ArticlesPage({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}) {
  const { segments = [] } = await params;
  const jsonLd = await articleJsonLd(segments);
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <Suspense fallback={null}>
        <ArticleRouteDispatcher />
      </Suspense>
    </>
  );
}
