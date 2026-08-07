"use client";

import { create } from "zustand";

/**
 * Comment composer store — transient UI state for the article comment input
 * (`_ArticleCommentsSectionState` in
 * `lib/articles/widgets/article_comment_section.dart`): the pending draft
 * text, the "Post anonymously" toggle and the sending flag. The submitted
 * comments are server state owned by React Query (`articlesKeys.comments`);
 * this store holds only the composer's in-progress UI.
 *
 * NOT persisted — a comment draft is temporary input (like a dialog's text
 * field) and must not survive restarts.
 */
export interface CommentComposerStore {
  /** The in-progress comment text (the `TextField` controller value). */
  draft: string;
  /** The "Post anonymously" toggle (Flutter's `_isAnonymous`). */
  isAnonymous: boolean;
  /** Whether a comment is currently being posted (Flutter's `_sending`). */
  isSending: boolean;
  setDraft: (draft: string) => void;
  setAnonymous: (isAnonymous: boolean) => void;
  setSending: (isSending: boolean) => void;
  /** Resets the composer after a successful post. */
  clear: () => void;
}

/** Comment input UI state (draft + anonymity + sending). */
export const useCommentComposerStore = create<CommentComposerStore>()((set) => ({
  draft: "",
  isAnonymous: false,
  isSending: false,
  setDraft: (draft) => set({ draft }),
  setAnonymous: (isAnonymous) => set({ isAnonymous }),
  setSending: (isSending) => set({ isSending }),
  clear: () => set({ draft: "", isAnonymous: false, isSending: false }),
}));
