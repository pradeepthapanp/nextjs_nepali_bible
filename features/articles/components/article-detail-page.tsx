"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MessageSquare,
  Share2,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { useSupabase } from "@/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import { copyTextToClipboard } from "@/utils/clipboard";
import { useBooks, useChapterAudio } from "@features/bible/queries";
import {
  buildBibleUrl,
  canonicalBook,
  referenceToString,
  toNepaliDigits,
} from "@features/bible/utils";
import {
  QUIZ_DEFAULT_DIFFICULTY,
  QUIZ_DEFAULT_LANGUAGE,
  QUIZ_DEFAULT_LIMIT,
} from "@features/quiz/constants";
import { useQuizBookHasQuestions } from "@features/quiz/queries";
import { buildQuizUrl } from "@features/quiz/utils";
import { RelatedLinks } from "@/components/related/related-links";
import { useArticleComments } from "../queries";
import {
  useArticleDetail,
  useArticleNavigation,
  useCommentComposer,
} from "../hooks";
import { ArticleContent } from "./article/article-content";
import { ArticleHeader } from "./article/article-header";
import { ArticleList } from "./article/article-list";
import { CommentComposer } from "./comments/comment-composer";
import { CommentList } from "./comments/comment-list";
import { ReaderSettingsPanel } from "./reader/reader-settings-panel";
import { ReaderToolbar } from "./reader/reader-toolbar";
import { ReaderSettingsProvider } from "./context/reader-settings-provider";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { FileQuestion } from "lucide-react";

export interface ArticleDetailPageProps {
  articleId: string;
}

/**
 * ArticleDetailPage — the page-level orchestration for the article reader
 * (the web replacement of `ArticleDetailsPage` / `_ArticleScaffold` in
 * `lib/articles/article_details_page.dart`): the single-article query (URL
 * deep link / refresh-safe), the one-shot view-count bump, the reader
 * settings, the content, the comments and the related articles.
 *
 * Composes ONLY behavior hooks + reusable components:
 *   - `useArticleDetail(articleId)` — article + view-count bump + related;
 *   - `useArticleComments` + `useCommentComposer` — the comments section;
 *   - `useSupabase` — the signed-in user id (`CommentList` "isMine" flags);
 *   - `useArticleNavigation` — open a related article (deep link);
 *   - the shared `copyTextToClipboard` (+ `navigator.share`) — the Share button.
 * No parsing / sanitizing (ArticleContent owns that), no Supabase, no
 * duplicated logic.
 */
export function ArticleDetailPage({ articleId }: ArticleDetailPageProps) {
  const router = useRouter();
  const { article, isLoading, isError, error, refetch, related, bumpViewCount } =
    useArticleDetail(articleId);
  const commentsQuery = useArticleComments(articleId);
  const composer = useCommentComposer(articleId);
  const { session } = useSupabase();
  const { openArticle } = useArticleNavigation();
  // Canonical book names — resolves the related-chapter label (reuses the
  // existing Bible books query; no new fetch).
  const { data: books } = useBooks();

  const [showSettings, setShowSettings] = useState(false);
  const currentUserId = session?.user?.id;

  // Related Bible chapter — driven by the article's EXISTING
  // `relatedBookNumber`/`relatedChapter` metadata (rendered only when both are
  // present; no invented relationships). The article stores the CANONICAL book
  // number (1..66), which is resolved to the app's book via the ordered list
  // before building the URL with the shared helper.
  const relatedBibleChapter = useMemo(() => {
    if (!article?.relatedBookNumber || !article.relatedChapter) return null;
    const book = canonicalBook(books ?? [], article.relatedBookNumber);
    if (!book) return null; // unresolvable — never link to a wrong book
    const reference = {
      bookNumber: book.bookNumber,
      chapter: article.relatedChapter,
    };
    return {
      href: buildBibleUrl({ kind: "chapter", ...reference }),
      label: referenceToString(reference, books ?? []),
      description: "Related Bible chapter",
    };
  }, [article, books]);

  // The article's related Bible chapter (app book code + chapter) — reused
  // by the audio and quiz links below so every related link stays anchored
  // to the SAME real relationship (no invented links).
  const relatedBook = useMemo(
    () =>
      article?.relatedBookNumber
        ? canonicalBook(books ?? [], article.relatedBookNumber)
        : undefined,
    [article, books],
  );
  const relatedChapter = article?.relatedChapter;

  // Related audio — the related chapter's audio track (existing
  // `nnrv_audios` data). Surfaced as a deep link to the Audio Bible page
  // when the track exists; hides itself otherwise.
  const { data: relatedAudioTrack } = useChapterAudio(
    relatedBook?.bookNumber ?? 0,
    relatedChapter ?? 0,
  );
  const relatedAudioLink =
    relatedBook && relatedChapter && relatedAudioTrack
      ? {
          href: `/audio-bible?book=${relatedBook.bookNumber}&chapter=${relatedChapter}`,
          label: `${relatedBook.longName} ${toNepaliDigits(relatedChapter)}`,
          description: "Related audio",
        }
      : null;

  // Related quiz — PUBLISHED quiz questions exist for the related BOOK
  // (`quiz_questions.book_number` stores the canonical 1..66 number, which is
  // exactly the article's `relatedBookNumber`). Only rendered when questions
  // exist — no invented link.
  const { data: relatedBookHasQuiz } = useQuizBookHasQuestions(
    article?.relatedBookNumber,
  );
  const relatedQuizLink =
    article?.relatedBookNumber && relatedBookHasQuiz
      ? {
          href: buildQuizUrl({
            kind: "play",
            difficulty: QUIZ_DEFAULT_DIFFICULTY,
            limit: QUIZ_DEFAULT_LIMIT,
            bookNumber: article.relatedBookNumber,
            languageCode: QUIZ_DEFAULT_LANGUAGE,
          }),
          label: relatedBook
            ? `${relatedBook.longName} Quiz`
            : "Bible Quiz",
          description: "Related quiz",
        }
      : null;

  // One-shot view-count bump per article (Flutter bumps on pop; the web bumps
  // once when the article is read). Mutation in an effect — not setState.
  const bumpedRef = useRef<string | null>(null);
  useEffect(() => {
    if (article && bumpedRef.current !== article.id) {
      bumpedRef.current = article.id;
      bumpViewCount();
    }
  }, [article, bumpViewCount]);

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.replace("/articles");
    }
  };

  const handleShare = async () => {
    if (!article) return;
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = article.title;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: text, text, url });
        return;
      } catch {
        // User cancelled — fall through to copy.
      }
    }
    await copyTextToClipboard(`${text}\n${url}`);
    toast.success("Link copied");
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-background text-foreground">
        <div className="mx-auto w-full max-w-3xl px-4 py-10">
          <LoadingState label="Loading article…" />
        </div>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="min-h-dvh bg-background text-foreground">
        <div className="mx-auto w-full max-w-3xl px-4 py-10">
          <ErrorState
            title="Unable to load article."
            description={error instanceof Error ? error.message : "Something went wrong."}
            onRetry={() => void refetch()}
          />
        </div>
      </div>
    );
  }
  if (!article) {
    return (
      <div className="min-h-dvh bg-background text-foreground">
        <div className="mx-auto w-full max-w-3xl px-4 py-10">
          <EmptyState
            icon={FileQuestion}
            title="Article not found"
            description="This article may have been removed."
          />
        </div>
      </div>
    );
  }

  return (
    <ReaderSettingsProvider>
      <div className="min-h-dvh bg-background text-foreground">
        <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
          <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-2 px-4 py-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Back to articles"
              onClick={goBack}
            >
              <ArrowLeft aria-hidden />
            </Button>
            <h1 className="min-w-0 flex-1 truncate text-sm font-semibold">
              {article.title}
            </h1>
            <ReaderToolbar />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Reader settings"
              aria-pressed={showSettings}
              onClick={() => setShowSettings((open) => !open)}
            >
              <SlidersHorizontal aria-hidden />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Share article"
              onClick={() => void handleShare()}
            >
              <Share2 aria-hidden />
            </Button>
          </div>
        </header>

        <article className="mx-auto w-full max-w-3xl pb-16">
          <ArticleHeader article={article} className="rounded-b-none" />

          {showSettings ? (
            <div className="px-4 pt-4">
              <ReaderSettingsPanel />
            </div>
          ) : null}

          <div className="px-4 pt-5">
            <ArticleContent content={article.content} />
          </div>

          <RelatedLinks
            title="Related Bible chapter"
            links={relatedBibleChapter ? [relatedBibleChapter] : []}
            className="px-4"
          />
          <RelatedLinks
            title="Related audio"
            links={relatedAudioLink ? [relatedAudioLink] : []}
            className="px-4"
          />
          <RelatedLinks
            title="Related quiz"
            links={relatedQuizLink ? [relatedQuizLink] : []}
            className="px-4"
          />

          <section aria-label="Comments" className="mt-8 px-4">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
              <MessageSquare className="size-4" aria-hidden />
              Comments
            </h2>
            <CommentComposer articleId={article.id} />
            <div className="mt-4">
              <CommentList
                comments={commentsQuery.data ?? []}
                isLoading={commentsQuery.isLoading}
                isError={commentsQuery.isError}
                onRetry={() => void commentsQuery.refetch()}
                currentUserId={currentUserId}
                onUpdate={composer.update}
                onDelete={composer.remove}
              />
            </div>
          </section>

          <section aria-label="Related articles" className="mt-10 px-4">
            <h2 className="mb-3 text-lg font-bold">Related articles</h2>
            <ArticleList
              articles={related.related}
              isLoading={related.isLoading}
              isError={related.isError}
              onRetry={() => void related.refetch()}
              onOpen={(item) => openArticle(item.id)}
            />
          </section>
        </article>
      </div>
    </ReaderSettingsProvider>
  );
}
