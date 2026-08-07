"use client";

import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils/cn";

export interface DevotionSuggestedReadingProps {
  onOpenHome: () => void;
  onShare: () => void;
  className?: string;
}

function Tile({
  reference,
  snippet,
  onClick,
}: {
  reference: string;
  snippet: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg bg-muted/30 p-3 text-left transition hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-primary">{reference}</span>
        <span className="block truncate text-sm text-muted-foreground">
          {snippet}
        </span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
    </button>
  );
}

/**
 * DevotionSuggestedReading — the "Read Bible" + "Share" tiles (the web port of
 * Flutter `TodaysDevotionPage._buildSuggestedReading` +
 * `_buildRelatedVerseTile`). Presentational — the page wires the handlers to
 * `useDevotionNavigation.openHome` / the share action.
 */
export function DevotionSuggestedReading({
  onOpenHome,
  onShare,
  className,
}: DevotionSuggestedReadingProps) {
  const t = useTranslations("devotion");
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="space-y-2 p-4">
        <Tile reference={t("readBible")} snippet={t("readBibleDesc")} onClick={onOpenHome} />
        <Tile
          reference={t("share")}
          snippet={t("shareDesc")}
          onClick={onShare}
        />
      </CardContent>
    </Card>
  );
}
