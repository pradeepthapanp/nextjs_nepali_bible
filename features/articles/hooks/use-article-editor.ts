"use client";

import { useCallback, useEffect, useState } from "react";
import { useSupabase } from "@/providers/supabase-provider";
import { getArticleServices } from "../services";
import { useCreateArticle, useUpdateArticle } from "../queries";
import { ARTICLE_IMAGE_UPLOAD_FOLDER, DEFAULT_ARTICLE_CATEGORY } from "../constants";
import { useArticleEditorStore, type ArticleEditorDraft } from "../store";
import type { Article } from "../types";
import { slugify } from "../utils/slugify";
import { fileExtension } from "@/utils/content-type";
import { INITIAL_UPLOAD_STATE, type UploadState } from "@/types/upload";

/**
 * useArticleEditor — the Add/Edit article form behavior (the web equivalent of
 * `_AddEditArticlePageState` in `lib/articles/add_edit_article_page.dart`).
 *
 * Composes:
 * - `useArticleEditorStore` (Zustand, PERSISTED `articles.draft`) — the draft
 *   + autosave bookkeeping (the persist middleware writes on every `update`);
 * - `useCreateArticle` / `useUpdateArticle` (React Query mutations);
 * - the SHARED `UploadService` (`getArticleServices().upload.uploadFile`) for
 *   the featured-image upload — NO upload logic is duplicated;
 * - the shared `useSupabase` provider — the current editor's name for
 *   `authorName` (Flutter's `profile.fullName`).
 *
 * HTML-ONLY / editor-agnostic: the draft's `content` is HTML. This hook never
 * sees or exposes Quill Delta — the Quill editor (a later phase) converts
 * Delta ⇄ HTML around the store (`store.update({ content: html })` /
 * `draft.content`). No `Article[]` lives here.
 *
 * The store is seeded from the loaded `article` (edit mode) in an effect —
 * keeping an in-progress autosave draft for the SAME article — and an empty
 * draft is started on a fresh create.
 */
export function useArticleEditor(article?: Article) {
  const { session } = useSupabase();
  const draft = useArticleEditorStore((state) => state.draft);
  const autosave = useArticleEditorStore((state) => state.autosave);
  const update = useArticleEditorStore((state) => state.update);
  const clear = useArticleEditorStore((state) => state.clear);
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();

  const [upload, setUpload] = useState<UploadState>(INITIAL_UPLOAD_STATE);

  const authorName =
    (session?.user?.user_metadata?.full_name as string | undefined) ?? "User";

  // Seed the store from the loaded article (edit) or an empty draft (create).
  useEffect(() => {
    const state = useArticleEditorStore.getState();
    if (article) {
      // Keep an in-progress autosave draft for the SAME article.
      if (state.draft?.id === article.id) return;
      const seed: ArticleEditorDraft = {
        id: article.id,
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt ?? "",
        content: article.content,
        category: article.category,
        published: article.published,
        featuredImage: article.featuredImage,
      };
      state.start(seed);
      return;
    }
    // Create mode: start a fresh empty draft. A stale draft belonging to a
    // PREVIOUS article (non-null id) is replaced; a persisted NEW draft
    // (id === null) is KEPT so a refresh restores the in-progress write.
    if (!state.draft || state.draft.id !== null) {
      state.start({
        id: null,
        slug: "",
        title: "",
        excerpt: "",
        content: "",
        category: DEFAULT_ARTICLE_CATEGORY,
        published: false,
      });
    }
  }, [article]);

  /** Upload a new featured image through the SHARED UploadService → media URL. */
  const uploadFeaturedImage = useCallback(
    async (blob: Blob, fileName: string): Promise<string> => {
      const ext = fileExtension(fileName);
      const path = `${ARTICLE_IMAGE_UPLOAD_FOLDER}/${Date.now()}.${ext}`;
      setUpload({
        isUploading: true,
        progress: 0,
        filePath: path,
        uploading: fileName,
        error: undefined,
      });
      try {
        const url = await getArticleServices().upload.uploadFile(
          blob,
          path,
          (progress) => setUpload((s) => ({ ...s, progress })),
        );
        setUpload(INITIAL_UPLOAD_STATE);
        return url;
      } catch (error) {
        setUpload((s) => ({
          ...s,
          isUploading: false,
          error: error instanceof Error ? error.message : String(error),
        }));
        throw error;
      }
    },
    [],
  );

  /** Validate + save the draft (create or update) using HTML content only. */
  const save = useCallback(async (): Promise<Article> => {
    const state = useArticleEditorStore.getState();
    const current = state.draft;
    if (!current) throw new Error("No draft to save");
    if (!current.title.trim()) throw new Error("Enter title");
    if (!current.excerpt.trim()) throw new Error("Enter short summary");
    if (!current.content.trim()) throw new Error("Content is empty");
    const now = new Date().toISOString();

    if (current.id && article) {
      // Edit: merge the draft's editable fields into the loaded article
      // (mirrors Flutter's `widget.article!.copyWith(...)`).
      const updated = await updateArticle.mutateAsync({
        ...article,
        title: current.title.trim(),
        slug: current.slug,
        excerpt: current.excerpt.trim(),
        content: current.content,
        category: current.category,
        featuredImage: current.featuredImage,
        published: current.published,
        authorName,
      });
      state.clear();
      return updated;
    }

    // Create: build a full article (id + timestamps), like Flutter's
    // `Uuid().v4()` + `DateTime.now()`; slug generated from the title.
    const createdArticle: Article = {
      id: crypto.randomUUID(),
      title: current.title.trim(),
      slug: slugify(current.title.trim()),
      excerpt: current.excerpt.trim(),
      content: current.content,
      category: current.category,
      featuredImage: current.featuredImage,
      authorName,
      languageCode: "en",
      featured: false,
      published: current.published,
      viewCount: 0,
      commentCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    const created = await createArticle.mutateAsync(createdArticle);
    state.clear();
    return created;
  }, [article, updateArticle, createArticle, authorName]);

  return {
    draft,
    autosave,
    hasChanges: autosave.dirty,
    isEditing: Boolean(draft?.id),
    isSaving: createArticle.isPending || updateArticle.isPending,
    update,
    clear,
    save,
    upload,
    uploadFeaturedImage,
  };
}
