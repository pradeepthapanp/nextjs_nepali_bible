import type { Metadata } from "next";
import { Suspense } from "react";
import { QuizHomePage } from "@/features/quiz/components/quiz-home-page";
import { pageDescriptions, seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Bible Quiz",
  description: pageDescriptions.quiz,
  path: "/quiz",
});

/**
 * Quiz route — the "Bible Quiz" setup page (PUBLIC).
 *
 * A thin server shell mounting the client page. `Suspense` is required because
 * `QuizHomePage` composes `useQuizNavigation`, which reads `useSearchParams`
 * (for `currentLink`), and this page is prerendered. No dispatcher — `/quiz`
 * and `/quiz/play` are two explicit route shells.
 */
export default function QuizRoute() {
  return (
    <Suspense fallback={null}>
      <QuizHomePage />
    </Suspense>
  );
}
