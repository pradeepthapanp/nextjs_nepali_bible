"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, PenTool, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/ui/loading-state";
import { useArticle, useCurrentProfile } from "../queries";
import { useArticleEditor } from "../hooks";
import { ArticleEditor } from "./editor/article-editor";
import { ImageUploader } from "./editor/image-uploader";
import { SaveIndicator } from "./editor/save-indicator";
import { PreviewPanel } from "./editor/preview-panel";
import { CategorySelector } from "./article/category-selector";
import { DiscardChangesDialog } from "./dialogs/discard-changes-dialog";
import { ReaderSettingsProvider } from "./context/reader-settings-provider";
import { cn } from "@/utils/cn";

export interface AddEditArticlePageProps {
  /** Present in edit mode (the route `/articles/edit/{id}`). */
  editId?: string;
}

/**
 * AddEditArticlePage — the admin create/edit form (the web replacement of
 * `AddEditArticlePage` in `lib/articles/add_edit_article_page.dart`).
 *
 * Compose ONLY existing pieces — NO editor/HTML⇄Delta/upload/autosave logic is
 * re-implemented here:
 *   - `useArticle(editId)` — loads the article being edited;
 *   - `useArticleEditor(article)` — the form behavior: the persisted draft
 *     store (title/excerpt/content/category/published/featuredImage), the
 *     autosave `hasChanges`, `save()` (validates + create/update), and the
 *     featured-image upload through the SHARED `UploadService`;
 *   - `ArticleEditor` — the Quill platform wrapper (HTML in/out, autosaves
 *     into the draft store; `advanced` = Flutter `_showAdvancedToolbar`);
 *   - `ImageUploader` / `SaveIndicator` / `PreviewPanel` / `CategorySelector`
 *     / `DiscardChangesDialog` — the reusable form surfaces;
 *   - `useCurrentProfile` — the admin/editor gate.
 */
export function AddEditArticlePage({ editId }: AddEditArticlePageProps) {
  const router = useRouter();
  const isEdit = Boolean(editId);

  const { data: article, isLoading: loadingArticle } = useArticle(
    isEdit ? editId : undefined,
  );
  const editor = useArticleEditor(isEdit && article ? article : undefined);
  const { canManage, isLoading: loadingProfile } = useCurrentProfile();

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  const dirtyRef = useRef(false);
  useEffect(() => {
    dirtyRef.current = editor.hasChanges;
  }, [editor.hasChanges]);

  // Browser-level guard: prevent accidental refresh/close with unsaved changes.
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const draft = editor.draft;
  const seeded = !isEdit || (article != null && draft?.id === article.id);
  const busy = editor.isSaving || editor.upload.isUploading;

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.replace("/articles");
    }
  };

  const attemptLeave = () => {
    if (editor.hasChanges) setDiscardOpen(true);
    else goBack();
  };

  const confirmDiscard = () => {
    setDiscardOpen(false);
    editor.clear();
    goBack();
  };

  const handleImage = async (file: File) => {
    try {
      const url = await editor.uploadFeaturedImage(file, file.name);
      editor.update({ featuredImage: url });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to upload image");
    }
  };

  const handleSave = async () => {
    if (busy) return;
    try {
      const saved = await editor.save();
      toast.success("Article saved");
      router.push(`/articles/${saved.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save article",
      );
    }
  };

  // Loading the edited article.
  if (isEdit && loadingArticle) {
    return (
      <div className="min-h-dvh bg-background text-foreground">
        <div className="mx-auto w-full max-w-2xl px-4 py-10">
          <LoadingState label="Loading article…" />
        </div>
      </div>
    );
  }
  if (isEdit && !article) {
    return (
      <div className="min-h-dvh bg-background text-foreground">
        <div className="mx-auto w-full max-w-2xl px-4 py-10">
          <ErrorState
            title="Article not found"
            description="This article may have been removed."
            onRetry={() => router.replace("/articles")}
          />
        </div>
      </div>
    );
  }
  // Admin/editor gate (mirrors the Songs editor).
  if (!loadingProfile && !canManage) {
    return (
      <div className="min-h-dvh bg-background text-foreground">
        <div className="mx-auto w-full max-w-2xl px-4 py-10">
          <EmptyState
            icon={ShieldAlert}
            title="Admin only"
            description="You need an admin or editor account to manage articles."
          />
        </div>
      </div>
    );
  }
  // Wait for the draft seed effect (edit mode) before rendering the form —
  // avoids a one-frame flash of empty fields.
  if (!seeded || !draft) {
    return (
      <div className="min-h-dvh bg-background text-foreground">
        <div className="mx-auto w-full max-w-2xl px-4 py-10">
          <LoadingState label="Preparing editor…" />
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
            onClick={attemptLeave}
          >
            <ArrowLeft aria-hidden />
          </Button>
          <h1 className="min-w-0 flex-1 text-lg font-bold">
            {isEdit ? "Edit Article" : "Add Article"}
          </h1>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Toggle advanced formatting"
            aria-pressed={showAdvanced}
            onClick={() => setShowAdvanced((open) => !open)}
          >
            <PenTool aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Toggle preview"
            aria-pressed={showPreview}
            onClick={() => setShowPreview((open) => !open)}
          >
            <Eye aria-hidden />
          </Button>
          <SaveIndicator saving={editor.isSaving} />
          <Button
            type="button"
            size="sm"
            onClick={() => void handleSave()}
            disabled={busy}
          >
            {busy ? "Saving…" : isEdit ? "Update" : "Save"}
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6 pb-16">
        <CategorySelector
          value={draft.category}
          onChange={(category) => {
            if (category !== "all") editor.update({ category });
          }}
          showAll={false}
        />

        <div className="space-y-2">
          <Label htmlFor="article-title">Title</Label>
          <Input
            id="article-title"
            value={draft.title}
            placeholder="Add article title here"
            onChange={(event) => editor.update({ title: event.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="article-excerpt">Short summary</Label>
          <Input
            id="article-excerpt"
            value={draft.excerpt}
            placeholder="Short summary"
            onChange={(event) => editor.update({ excerpt: event.target.value })}
          />
        </div>

        <ImageUploader
          value={draft.featuredImage}
          onFileSelected={(file) => void handleImage(file)}
          uploading={editor.upload.isUploading}
          progress={editor.upload.progress}
          error={editor.upload.error}
        />

        <div className={cn("space-y-2")}>
          <Label htmlFor="article-content">Content</Label>
          <ArticleEditor
            value={draft.content}
            onChange={(html) => editor.update({ content: html })}
            advanced={showAdvanced}
            minHeight={280}
            placeholder="Write your article here..."
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={draft.published}
            onChange={(event) =>
              editor.update({ published: event.target.checked })
            }
            className="size-4"
          />
          Published
        </label>

        {showPreview ? (
          <PreviewPanel content={draft.content} />
        ) : null}
      </main>

      <DiscardChangesDialog
        open={discardOpen}
        onOpenChange={setDiscardOpen}
        onConfirm={confirmDiscard}
      />
    </div>
    </ReaderSettingsProvider>
  );
}
