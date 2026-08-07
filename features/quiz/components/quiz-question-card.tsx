"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { QuizQuestion } from "../types";
import { QuizOption } from "./quiz-option";
import { cn } from "@/utils/cn";

export interface QuizQuestionCardProps {
  question: QuizQuestion;
  /** True once the current question has been answered (locks the options). */
  answered: boolean;
  /** The selected option index (null = unanswered) — restored on Previous. */
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  className?: string;
}

/**
 * QuizQuestionCard — one question + its options + the after-answer feedback
 * (the web port of Flutter `QuizPage`: the question card, the `buildOption`
 * list, the Correct!/Wrong banner and the explanation card). Presentational —
 * the play page supplies `question`, `answered`, `selectedIndex` and the
 * select handler; the option statuses are derived here from the correct answer
 * (no scoring logic duplicated).
 */
export function QuizQuestionCard({
  question,
  answered,
  selectedIndex,
  onSelect,
  className,
}: QuizQuestionCardProps) {
  const keys = Object.keys(question.options);
  const isCorrect = selectedIndex !== null && keys[selectedIndex] === question.correctAnswer;

  const optionStatus = (index: number): "idle" | "correct" | "wrong" => {
    if (!answered) return "idle";
    if (keys[index] === question.correctAnswer) return "correct";
    if (index === selectedIndex) return "wrong";
    return "idle";
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Card>
        <CardContent className="p-5">
          <p className="text-lg font-semibold leading-relaxed">{question.question}</p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {keys.map((key, index) => (
          <QuizOption
            key={key}
            optionKey={key}
            optionText={question.options[key]}
            status={optionStatus(index)}
            onSelect={() => onSelect(index)}
            disabled={answered}
          />
        ))}
      </div>

      {answered ? (
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl p-3 text-sm font-medium",
            isCorrect
              ? "bg-green-500/10 text-green-700 dark:text-green-300"
              : "bg-red-500/10 text-red-700 dark:text-red-300",
          )}
        >
          {isCorrect ? (
            <CheckCircle2 className="size-4" aria-hidden />
          ) : (
            <XCircle className="size-4" aria-hidden />
          )}
          {isCorrect ? "Correct!" : "Wrong Answer"}
        </div>
      ) : null}

      {answered && question.explanation ? (
        <div className="rounded-xl bg-muted/60 p-4 text-sm leading-relaxed">
          {question.explanation}
        </div>
      ) : null}
    </div>
  );
}
