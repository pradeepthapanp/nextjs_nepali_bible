"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ArticleCategory } from "../types";

/**
 * Article editor store — draft/autosave state for the Add/Edit form (the web
 * equivalent of the `_AddEditArticlePageState` controllers + `_hasChanges` in
 * `lib/articles/add_edit_article_page.dart`).
 *
 * This is FORM state (UI state), NOT server data — it holds the pending
 * title / excerpt / HTML content / category / published / featured-image of a
 * draft being written. The saved articles themselves are server state owned by
 * React Query (`articlesKeys`). No `Article[]` / `Comment[]` ever lives here.
 *
 * `content` is stored as **HTML** (the canonical article format) so this store
 * is editor-agnostic — the future Quill editor converts Delta ⇄ HTML around
 * it (see `editor/README.md`), never the other way.
 *
 * PERSISTED to localStorage (`articles.draft`, via `partialize`) so an
 * unpublished draft survives a refresh — the ONLY intentionally persisted
 * "form" state here (per the architecture README's autosave note). The
 * `autosave` bookkeeping (dirty/lastSavedAt) is deliberately NOT persisted —
 * a restored draft starts clean. Everything else is transient UI.
 */
export interface ArticleEditorDraft {
  /** The article id being edited, or null for a brand-new draft. */
  id: string | null;
  title: string;
  /** URL slug (preserved on edit; generated from the title on create). */
  slug: string;
  excerpt: string;
  /** HTML content (canonical format — the Quill editor converts around this). */
  content: string;
  category: ArticleCategory;
  /** Draft = false, Publish = true (Flutter's `published` checkbox). */
  published: boolean;
  /** The current featured-image URL (a newly-picked local File is transient UI, not stored here). */
  featuredImage?: string;
}

export interface ArticleEditorStore {
  draft: ArticleEditorDraft | null;
  /** Autosave bookkeeping (UI state, NOT persisted — restored drafts start clean). */
  autosave: {
    /** True while the form has unsaved changes (the editor's `_hasChanges`). */
    dirty: boolean;
    /** ISO timestamp of the last successful save. */
    lastSavedAt: string | null;
  };
  /** Open the editor with an initial draft (new or editing) — starts clean. */
  start: (draft: ArticleEditorDraft) => void;
  /** Apply a field patch and mark the draft dirty. */
  update: (patch: Partial<ArticleEditorDraft>) => void;
  /** Clear the dirty flag + stamp `lastSavedAt` after a successful save. */
  markSaved: () => void;
  /** Discard the draft (restores the autosave defaults). */
  clear: () => void;
}

export const useArticleEditorStore = create<ArticleEditorStore>()(
  persist(
    (set) => ({
      draft: null,
      autosave: { dirty: false, lastSavedAt: null },
      start: (draft) => set({ draft, autosave: { dirty: false, lastSavedAt: null } }),
      update: (patch) =>
        set((state) =>
          state.draft
            ? {
                draft: { ...state.draft, ...patch },
                autosave: { ...state.autosave, dirty: true },
              }
            : state,
        ),
      markSaved: () =>
        set({
          autosave: { dirty: false, lastSavedAt: new Date().toISOString() },
        }),
      clear: () =>
        set({ draft: null, autosave: { dirty: false, lastSavedAt: null } }),
    }),
    {
      name: "articles.draft",
      storage: createJSONStorage(() => localStorage),
      // Persist ONLY the draft (the autosave bookkeeping is transient and must
      // not survive restarts — a restored draft starts clean).
      partialize: (state) => ({ draft: state.draft }),
      // New fields added to the draft over time fall back to defaults when a
      // stored snapshot predates them (merge over the current shape).
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<ArticleEditorStore>),
      }),
      version: 1,
    },
  ),
);
