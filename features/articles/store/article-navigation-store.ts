"use client";

import { create } from "zustand";
import type { ArticleCategory } from "../types";

/**
 * Article navigation store — transient UI state for pending navigation
 * (mirrors the Music `useReaderNavigationStore`).
 *
 * Holds a PENDING navigation target that the Articles section should apply
 * once it mounts (e.g. an article id that landed before the detail page /
 * list was ready, or a category deep link). `consumePendingTarget` is a
 * one-shot read that clears it, so the target is applied exactly once. The
 * actual data for the target (article, category list) is resolved from React
 * Query — never stored here.
 *
 * UI state only — NOT persisted (a pending navigation must not survive a
 * restart).
 */
export type ArticleNavigationTarget =
  | { kind: "article"; articleId: string }
  | { kind: "category"; category: ArticleCategory };

export interface ArticleNavigationStore {
  pendingTarget: ArticleNavigationTarget | null;
  setPendingTarget: (target: ArticleNavigationTarget | null) => void;
  /** Reads and clears the pending target (applied exactly once). */
  consumePendingTarget: () => ArticleNavigationTarget | null;
}

/** Pending navigation context (UI state only). */
export const useArticleNavigationStore = create<ArticleNavigationStore>()(
  (set, get) => ({
    pendingTarget: null,
    setPendingTarget: (pendingTarget) => set({ pendingTarget }),
    consumePendingTarget: () => {
      const target = get().pendingTarget;
      if (target) set({ pendingTarget: null });
      return target;
    },
  }),
);
