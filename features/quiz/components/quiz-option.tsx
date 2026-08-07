"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/utils/cn";

export interface QuizOptionProps {
  /** The option key (e.g. "A") — Flutter `Map` key shown in the circle avatar. */
  optionKey: string;
  optionText: string;
  /** The option state after answering: correct / wrong-selected / untouched. */
  status: "idle" | "correct" | "wrong";
  onSelect: () => void;
  disabled?: boolean;
}

/**
 * QuizOption — a presentational answer tile (the web port of the option row in
 * Flutter `QuizPage.buildOption`): the letter key (circle avatar), the option
 * text, and after answering the correct (green + check) / wrong-selected (red
 * + cancel) coloring. The parent derives `status` — no scoring here.
 */
export function QuizOption({
  optionKey,
  optionText,
  status,
  onSelect,
  disabled = false,
}: QuizOptionProps) {
  const showFeedback = status !== "idle";
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        status === "correct" && "border-green-500/60 bg-green-500/10",
        status === "wrong" && "border-red-500/60 bg-red-500/10",
        status === "idle" && "border-primary/20 bg-transparent hover:bg-muted/50",
        disabled && "cursor-default",
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-foreground">
        {optionKey}
      </span>
      <span className="flex-1 text-base font-medium">{optionText}</span>
      {showFeedback ? (
        status === "correct" ? (
          <Check className="size-5 shrink-0 text-green-600" aria-hidden />
        ) : (
          <X className="size-5 shrink-0 text-red-600" aria-hidden />
        )
      ) : null}
    </button>
  );
}
