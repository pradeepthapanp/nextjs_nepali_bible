"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  useArticleLibrary,
  useArticleNavigation,
  useArticleSearch,
} from "../hooks";
import { ARTICLE_CATEGORY_ORDER } from "../constants";
import type { Article, ArticleCategory } from "../types";
import { ArticleList } from "./article/article-list";
import { CategorySelector } from "./article/category-selector";
import { ArticleSearchBar } from "./search/article-search-bar";
import { SearchResults } from "./search/search-results";

/**
 * ArticleListPage — the page-level orchestration for the Articles library
 * (the web replacement of `ArticlesPage` in `lib/articles/articles_page.dart`):
 * the paginated list (infinite), the client-side category filter, the
 * (web-refinement) search, loading/error/empty states, the admin "Add" entry
 * and per-card edit/delete.
 *
 * Composes ONLY behavior hooks + reusable components:
 *   - `useArticleLibrary` — the infinite list + category filter + delete +
 *     `canManage` (admin gate);
 *   - `useArticleSearch` — the debounced search (input → React Query);
 *   - `useArticleNavigation` — open article / category / new (deep links).
 * No parsing, no sanitization, no Supabase, no duplicated logic.
 */
export function ArticleListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    articles,
    isLoading,
    isError,
    error,
    hasMore,
    isLoadingMore,
    loadMore,
    refetch,
    category,
    setCategory,
    deleteArticle,
    canManage,
  } = useArticleLibrary();
  const search = useArticleSearch();
  const { openArticle, openCategory, openNew } = useArticleNavigation();

  // Deep-link category: `/articles?category=…` (browser history + refresh-safe).
  // Applies the URL category to the filter store when it differs (zustand
  // action in an effect — NOT React setState); back/forward and refresh land
  // here too. Invalid values fall back to "all".
  const urlCategory = searchParams.get("category");
  useEffect(() => {
    const valid =
      urlCategory &&
      (ARTICLE_CATEGORY_ORDER as readonly string[]).includes(urlCategory);
    const next: ArticleCategory | "all" = valid
      ? (urlCategory as ArticleCategory)
      : "all";
    if (next !== category) setCategory(next);
  }, [urlCategory, category, setCategory]);

  const handleCategoryChange = (next: ArticleCategory | "all") => {
    if (next === "all") {
      setCategory("all");
      router.push("/articles");
    } else {
      openCategory(next);
      setCategory(next);
    }
  };

  const handleDelete = (article: Article) => {
    deleteArticle(article, {
      onSuccess: () => toast.success("Article deleted successfully."),
      onError: () => toast.error("Unable to delete article."),
    });
  };

  const searching = search.query.trim().length > 0;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto w-full max-w-6xl space-y-3 px-4 pb-3 pt-3">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl font-bold">Articles</h1>
            {canManage ? (
              <Button type="button" size="sm" onClick={openNew}>
                <Plus aria-hidden />
                Add Article
              </Button>
            ) : null}
          </div>
          <ArticleSearchBar />
          <CategorySelector value={category} onChange={handleCategoryChange} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-16">
        {searching ? (
          <SearchResults
            results={search.results.data ?? []}
            isLoading={search.isSearching && !search.results.data}
            isError={search.results.isError}
            onRetry={() => void search.results.refetch()}
            onOpen={(article) => openArticle(article.id)}
          />
        ) : (
          <ArticleList
            articles={articles}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRetry={refetch}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={loadMore}
            onOpen={(article) => openArticle(article.id)}
            canManage={canManage}
            onEdit={(article) => router.push(`/articles/edit/${article.id}`)}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  );
}
