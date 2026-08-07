"use client";

import { CalendarCheck, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { formatDevotionDate } from "../utils";
import type { Devotion, DevotionBibleReference } from "../types";
import { DevotionContent } from "./devotion-content";
import { cn } from "@/utils/cn";

export interface DevotionCardProps {
  devotion: Devotion;
  onOpenReference: (reference: DevotionBibleReference) => void;
  className?: string;
}

/**
 * DevotionCard — the "आजको वचन" card (the Flutter `TodaysDevotionPage` card):
 * the heading + date rows, a divider and the devotion body (`DevotionContent`).
 * Presentational — the page supplies the devotion + the reference handler.
 */
export function DevotionCard({
  devotion,
  onOpenReference,
  className,
}: DevotionCardProps) {
  const t = useTranslations("devotion");
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-3">
          <Sparkles className="size-5 text-primary" aria-hidden />
          <h2 className="text-2xl font-bold text-primary">{t("heading")}</h2>
        </div>
        <div className="flex items-center gap-2 text-base font-medium">
          <CalendarCheck className="size-4 text-muted-foreground" aria-hidden />
          <span>{formatDevotionDate()}</span>
        </div>
        <div className="h-px w-full bg-border" aria-hidden />
        <DevotionContent
          content={devotion.devotion}
          onOpenReference={onOpenReference}
        />
      </CardContent>
    </Card>
  );
}
