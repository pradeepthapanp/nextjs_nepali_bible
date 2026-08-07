"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import {
  QUIZ_DEFAULT_DIFFICULTY,
  QUIZ_DEFAULT_LANGUAGE,
  QUIZ_DEFAULT_LIMIT,
} from "../constants";
import { useQuizNavigation } from "../hooks";
import { useQuizQuestions } from "../queries";
import type { QuizParam } from "../types";
import { QuizErrorState } from "./quiz-error-state";
import { QuizProgress } from "./quiz-progress";
import { QuizQuestionCard } from "./quiz-question-card";
import { QuizResultsDialog } from "./quiz-results-dialog";

/**
 * QuizPlayPage — page-level orchestration for the quiz PLAY (the web
 * replacement of Flutter `_InitializeQuizPage` + `QuizPage` in
 * `lib/quiz/quiz_home.dart` / `lib/quiz/quiz_page.dart`, at `/quiz/play?…`,
 * PUBLIC — no auth gate).
 *
 * COMPOSES ONLY existing pieces — no Supabase, no query/navigation logic is
 * re-implemented here:
 *   - `useQuizNavigation` — `currentLink` (the play setup from the URL),
 *     `goBack` (leave the quiz);
 *   - `useQuizQuestions(param)` — the question bank (loading/error/empty);
 *   - the shared `LoadingState` / `EmptyState` / `PageContainer`;
 *   - `QuizProgress` / `QuizQuestionCard` / `QuizResultsDialog` — the play
 *     surfaces.
 * The play state is TRANSIENT LOCAL state (the Flutter `_QuizPageState`
 * port): `currentIndex` + an `answers` array (index → selected option, null =
 * unanswered). The answers array is what enables PREVIOUS / NEXT (a web
 * refinement — Flutter only moves forward): navigating back restores the
 * saved selection + answered state; Finish scores from the answers. Restart
 * clears the answers. The array is seeded via the render-phase state-adjustment
 * pattern (no setState in effects).
 */
export function QuizPlayPage() {
  const { currentLink, goBack } = useQuizNavigation();

  const param = useMemo<QuizParam>(
    () => ({
      difficulty:
        currentLink?.kind === "play"
          ? currentLink.difficulty
          : QUIZ_DEFAULT_DIFFICULTY,
      limit:
        currentLink?.kind === "play" ? currentLink.limit : QUIZ_DEFAULT_LIMIT,
      bookNumber:
        currentLink?.kind === "play" ? currentLink.bookNumber : undefined,
      languageCode:
        currentLink?.kind === "play"
          ? currentLink.languageCode
          : QUIZ_DEFAULT_LANGUAGE,
    }),
    [currentLink],
  );

  const { data: questions, isLoading, isError, error, refetch } =
    useQuizQuestions(param);

  // --- Play state (transient local — the Flutter _QuizPageState port) ---
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [seededCount, setSeededCount] = useState(0);
  const [resultsOpen, setResultsOpen] = useState(false);

  // Seed the answers array when the question bank is (re)loaded — the
  // render-phase state-adjustment pattern (no setState in effects).
  if (questions && questions.length !== seededCount) {
    setSeededCount(questions.length);
    setAnswers(questions.map(() => null));
    setCurrentIndex(0);
    setResultsOpen(false);
  }

  const total = questions?.length ?? 0;
  const answered = answers[currentIndex] !== null;
  const selectedIndex = answers[currentIndex] ?? null;

  const correct = questions
    ? questions.reduce(
        (count, question, index) =>
          answers[index] === null
            ? count
            : count +
              (Object.keys(question.options)[answers[index]!] ===
              question.correctAnswer
                ? 1
                : 0),
        0,
      )
    : 0;
  const answeredCount = answers.filter((answer) => answer !== null).length;
  const wrong = answeredCount - correct;

  const selectAnswer = (index: number) => {
    if (answered) return;
    setAnswers((previous) => {
      const next = [...previous];
      next[currentIndex] = index;
      return next;
    });
  };

  const next = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex((index) => index + 1);
    } else {
      setResultsOpen(true);
    }
  };

  const previous = () => {
    if (currentIndex > 0) setCurrentIndex((index) => index - 1);
  };

  const restart = () => {
    setAnswers(questions ? questions.map(() => null) : []);
    setCurrentIndex(0);
    setResultsOpen(false);
  };

  const close = () => {
    setResultsOpen(false);
    goBack();
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Back to quiz"
            onClick={goBack}
          >
            <ArrowLeft aria-hidden />
          </Button>
          <h1 className="text-xl font-bold">
            {total > 0 ? `Question ${currentIndex + 1}/${total}` : "Quiz"}
          </h1>
        </div>
      </header>

      <PageContainer maxWidth="3xl" className="py-6 pb-16">
        {isLoading ? (
          <LoadingState label="Preparing Quiz…" />
        ) : isError ? (
          <QuizErrorState error={error} onRetry={() => void refetch()} />
        ) : !questions || questions.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No questions available for your selection"
            description="Try adjusting your quiz settings."
          />
        ) : (
          <div className="space-y-6">
            <QuizProgress
              current={currentIndex + 1}
              total={total}
              correct={correct}
              wrong={wrong}
            />

            <QuizQuestionCard
              question={questions[currentIndex]}
              answered={answered}
              selectedIndex={selectedIndex}
              onSelect={selectAnswer}
            />

            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={previous}
                disabled={currentIndex === 0}
              >
                Previous
              </Button>
              <Button
                type="button"
                onClick={next}
                disabled={!answered}
              >
                {currentIndex === total - 1 ? "Finish" : "Next"}
              </Button>
            </div>
          </div>
        )}
      </PageContainer>

      <QuizResultsDialog
        open={resultsOpen}
        correct={correct}
        wrong={wrong}
        total={total}
        onPlayAgain={restart}
        onClose={close}
      />
    </div>
  );
}
