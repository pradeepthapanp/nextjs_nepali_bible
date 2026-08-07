"use client";

import { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import {
  buildArticleUrl,
  parseArticlePath,
  useArticleNavigation,
} from "../hooks";
import { ArticleDetailPage } from "./article-detail-page";
import { ArticleListPage } from "./article-list-page";

/**
 * The Add/Edit editor page is lazy-loaded with `ssr: false`: the Quill Editor
 * Platform (`quill`) touches `document` at MODULE LOAD and must never be
 * evaluated in the server bundle — this keeps Quill out of the SSR graph (the
 * list/detail pages stay fully server-rendered; only the editor hydrates
 * client-side).
 */
const AddEditArticlePage = dynamic(
  () =>
    import("./add-edit-article-page").then(
      (module) => module.AddEditArticlePage,
    ),
  { ssr: false },
);

/**
 * ArticleRouteDispatcher — route-level dispatch for the `/articles` catch-all
 * (the counterpart to the Bible/Music route dispatchers).
 *
 * Supported shapes (parsed by `parseArticlePath`):
 *   /articles                    → ArticleListPage (category `?category=` deep link)
 *   /articles/{id}               → ArticleDetailPage
 *   /articles/new                → AddEditArticlePage (create)
 *   /articles/edit/{id}          → AddEditArticlePage (edit)
 *
 * Each child reads its own data/deep links from the URL, so this component
 * only picks which page to mount. A `pendingTarget` set in the navigation
 * store before the section mounted (e.g. by an external entry point) is
 * consumed once and turned into a real navigation here.
 */
export function ArticleRouteDispatcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { pendingTarget, consumePendingTarget } = useArticleNavigation();

  const link = useMemo(() => parseArticlePath(pathname), [pathname]);

  // Apply a pending deep-link target exactly once (one-shot store read).
  useEffect(() => {
    if (!pendingTarget) return;
    const target = consumePendingTarget();
    if (target) {
      router.replace(buildArticleUrl(target));
    }
  }, [pendingTarget, consumePendingTarget, router]);

  if (link?.kind === "article") {
    return <ArticleDetailPage articleId={link.articleId} />;
  }
  if (link?.kind === "new") {
    return <AddEditArticlePage />;
  }
  if (link?.kind === "edit") {
    return <AddEditArticlePage editId={link.articleId} />;
  }
  return <ArticleListPage />;
}
