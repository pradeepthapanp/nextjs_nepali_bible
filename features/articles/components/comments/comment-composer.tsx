"use client";

import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCommentComposer } from "../../hooks";
import { cn } from "@/utils/cn";

export interface CommentComposerProps {
  articleId: string;
  className?: string;
}

/**
 * CommentComposer — the "write a comment" input (the web replacement of
 * `_ArticleCommentsSectionState._buildCommentInput`): textarea + "Post
 * anonymously" toggle + Post button, plus the sign-in prompt when signed out.
 *
 * COMPOSES `useCommentComposer(articleId)` — the draft / anonymous / sending
 * state and the `submit` mutation wiring live in the hook; this component only
 * renders them.
 */
export function CommentComposer({ articleId, className }: CommentComposerProps) {
  const {
    draft,
    isAnonymous,
    isSending,
    setDraft,
    setAnonymous,
    submit,
    isSignedIn,
  } = useCommentComposer(articleId);

  if (!isSignedIn) {
    return (
      <div className="rounded-lg border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
        Sign in to post comments
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      className={cn("space-y-2", className)}
    >
      <textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Write a comment..."
        rows={3}
        disabled={isSending}
        className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
      />
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(event) => setAnonymous(event.target.checked)}
            disabled={isSending}
            className="size-4"
          />
          Post anonymously
        </label>
        <Button type="submit" disabled={isSending || !draft.trim()}>
          {isSending ? "Sending…" : (
            <>
              <Send /> Post
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
