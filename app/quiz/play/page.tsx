import type { Metadata } from "next";
import { Suspense } from "react";
import { QuizPlayPage } from "@/features/quiz/components/quiz-play-page";
import { pageDescriptions, seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Bible Quiz",
  description: pageDescriptions.quiz,
  path: "/quiz/play",
});

/**
 * Quiz play route — the quiz PLAY page (PUBLIC).
 *
 * A thin server shell mounting the client page. `Suspense` is required because
 * `QuizPlayPage` composes `useQuizNavigation`, which reads `useSearchParams`
 * (the play setup from the query string: difficulty / limit / book / lang),
 * and this page is prerendered. No dispatcher — `/quiz` and `/quiz/play` are
 * two explicit route shells.
 */
export default function QuizPlayRoute() {
  return (
    <Suspense fallback={null}>
      <QuizPlayPage />
    </Suspense>
  );
}
