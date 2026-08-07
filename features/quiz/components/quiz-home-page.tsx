"use client";

import { useState } from "react";
import {
  BookOpen,
  Gauge,
  Languages,
  ListOrdered,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PageContainer } from "@/components/ui/page-container";
import {
  QUIZ_BIBLE_BOOKS,
  QUIZ_DEFAULT_DIFFICULTY,
  QUIZ_DEFAULT_LANGUAGE,
  QUIZ_DEFAULT_LIMIT,
  QUIZ_DIFFICULTIES,
  QUIZ_LANGUAGES,
  QUIZ_LIMIT_OPTIONS,
} from "../constants";
import { useQuizNavigation } from "../hooks";
import type { QuizDifficulty } from "../types";

function SetupField({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" aria-hidden />
        <Label className="text-sm font-semibold">{label}</Label>
      </div>
      {children}
    </div>
  );
}

const SELECT_CLASS =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/**
 * QuizHomePage — page-level orchestration for the "Bible Quiz" setup (the web
 * replacement of `QuizHomePage` in `lib/quiz/quiz_home.dart`, at `/quiz`,
 * PUBLIC — no auth gate).
 *
 * COMPOSES ONLY existing pieces — no Supabase, no queries, no navigation logic
 * is re-implemented here:
 *   - `useQuizNavigation` — `startQuiz(param)` (pushes `/quiz/play?…`);
 *   - the `QUIZ_*` constants — the faithful difficulty / book (1..66) /
 *     question-count / language options;
 *   - the shared `Card` / `Label` / `Button` + native `<select>` dropdowns
 *     (the web `<select>` convention from the Reader/Community surfaces).
 * The selections are local `useState` (Flutter widget state). NOTE (faithful):
 * there is NO Bible version / Testament selector — those are not in the Flutter
 * quiz (documented in the README).
 */
export function QuizHomePage() {
  const { startQuiz } = useQuizNavigation();
  const [difficulty, setDifficulty] = useState<QuizDifficulty>(
    QUIZ_DEFAULT_DIFFICULTY,
  );
  const [bookNumber, setBookNumber] = useState<number | null>(null);
  const [limit, setLimit] = useState<number>(QUIZ_DEFAULT_LIMIT);
  const [languageCode, setLanguageCode] = useState<string>(QUIZ_DEFAULT_LANGUAGE);

  const handleStart = () => {
    startQuiz({
      difficulty,
      bookNumber: bookNumber ?? undefined,
      limit,
      languageCode,
    });
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex w-full max-w-3xl items-center px-4 py-3">
          <h1 className="flex items-center gap-2 text-xl font-bold">
            <BookOpen className="size-5 text-primary" aria-hidden />
            Bible Quiz
          </h1>
        </div>
      </header>

      <PageContainer maxWidth="3xl" className="py-6 pb-16">
        <Card>
          <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
            <SetupField icon={Gauge} label="Difficulty">
              <select
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value as QuizDifficulty)}
                aria-label="Difficulty"
                className={SELECT_CLASS}
              >
                {QUIZ_DIFFICULTIES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </SetupField>

            <SetupField icon={BookOpen} label="Book">
              <select
                value={bookNumber ?? ""}
                onChange={(event) =>
                  setBookNumber(event.target.value === "" ? null : Number(event.target.value))
                }
                aria-label="Book"
                className={SELECT_CLASS}
              >
                <option value="">📖 All Books</option>
                {QUIZ_BIBLE_BOOKS.map((book) => (
                  <option key={book.bookNumber} value={book.bookNumber}>
                    📕 {book.name}
                  </option>
                ))}
              </select>
            </SetupField>

            <SetupField icon={ListOrdered} label="Number of Questions">
              <select
                value={limit}
                onChange={(event) => setLimit(Number(event.target.value))}
                aria-label="Number of Questions"
                className={SELECT_CLASS}
              >
                {QUIZ_LIMIT_OPTIONS.map((count) => (
                  <option key={count} value={count}>
                    {count} Questions
                  </option>
                ))}
              </select>
            </SetupField>

            <SetupField icon={Languages} label="Language">
              <select
                value={languageCode}
                onChange={(event) => setLanguageCode(event.target.value)}
                aria-label="Language"
                className={SELECT_CLASS}
              >
                {QUIZ_LANGUAGES.map((language) => (
                  <option key={language.value} value={language.value}>
                    {language.label}
                  </option>
                ))}
              </select>
            </SetupField>

            <Button
              type="button"
              size="lg"
              className="w-full sm:col-span-2"
              onClick={handleStart}
            >
              <Play aria-hidden />
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    </div>
  );
}
