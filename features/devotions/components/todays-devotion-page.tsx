"use client";

import { useState } from "react";
import { ArrowLeft, SlidersHorizontal, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import {
  ReaderSettingsPanel,
  ReaderSettingsProvider,
  ReaderToolbar,
} from "@/components/reader";
import { useDailyDevotion } from "../queries";
import {
  useDevotionNavigation,
  useDevotionReaderSettings,
  useDevotionShare,
} from "../hooks";
import { DevotionCard } from "./devotion-card";
import { DevotionErrorState } from "./devotion-error-state";
import { DevotionShareButton } from "./devotion-share-button";
import { DevotionSuggestedReading } from "./devotion-suggested-reading";

/**
 * TodaysDevotionPage — page-level orchestration for the Today's Devotion
 * (the web replacement of `TodaysDevotionPage` in
 * `lib/devotions/todays_devotion_page.dart`, PUBLIC — no auth gate).
 *
 * COMPOSES ONLY existing pieces — no Supabase, no queries, no sanitization, no
 * share/navigation logic is re-implemented here:
 *   - `useDailyDevotion` (React Query) — today's devotion (loading/error/empty);
 *   - `useDevotionReaderSettings` → the shared `ReaderSettingsProvider` +
 *     `ReaderToolbar` / `ReaderSettingsPanel` (font size / line height / font
 *     family / alignment / theme — persisted);
 *   - `useDevotionNavigation` — `openBibleReference` (B: links), `goBack`,
 *     `openHome` (Read Bible tile);
 *   - `useDevotionShare` — the share action (the DevotionShareButton +
 *     the "Share" tile);
 *   - `DevotionCard` / `DevotionSuggestedReading` / `DevotionErrorState` — the
 *     reusable surfaces.
 * This page is orchestration only — business logic stays inside the hooks.
 */
export function TodaysDevotionPage() {
  const t = useTranslations("devotion");
  const tc = useTranslations("common");
  const settings = useDevotionReaderSettings();
  const { data: devotion, isLoading, isError, error, refetch } =
    useDailyDevotion();
  const { openBibleReference, goBack, openHome } = useDevotionNavigation();
  const { share, isSharing } = useDevotionShare();
  const [showSettings, setShowSettings] = useState(false);

  const handleShare = async () => {
    if (!devotion) return;
    await share(devotion.devotion);
    toast.success(t("sharedSuccess"));
  };

  return (
    <ReaderSettingsProvider value={settings}>
      <div className="min-h-dvh bg-background text-foreground">
        <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
          <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-2 px-4 py-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={tc("back")}
              onClick={goBack}
            >
              <ArrowLeft aria-hidden />
            </Button>
            <h1 className="min-w-0 flex-1 truncate text-sm font-semibold">
              {t("pageTitle")}
            </h1>
            <ReaderToolbar />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t("readerSettings")}
              aria-pressed={showSettings}
              onClick={() => setShowSettings((open) => !open)}
            >
              <SlidersHorizontal aria-hidden />
            </Button>
            <DevotionShareButton
              onClick={() => void handleShare()}
              isSharing={isSharing}
            />
          </div>
        </header>

        <PageContainer maxWidth="3xl" className="py-6 pb-16">
          {showSettings ? <ReaderSettingsPanel className="mb-6" /> : null}

          {isLoading ? (
            <LoadingState label={t("loading")} />
          ) : isError ? (
            <DevotionErrorState error={error} onRetry={() => void refetch()} />
          ) : !devotion ? (
            <EmptyState
              icon={Sparkles}
              title={t("noDevotion")}
              description={t("noDevotionDesc")}
            />
          ) : (
            <div className="space-y-6">
              <DevotionCard
                devotion={devotion}
                onOpenReference={openBibleReference}
              />
              <DevotionSuggestedReading
                onOpenHome={openHome}
                onShare={() => void handleShare()}
              />
            </div>
          )}
        </PageContainer>
      </div>
    </ReaderSettingsProvider>
  );
}
