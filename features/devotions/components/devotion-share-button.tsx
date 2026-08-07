"use client";

import { Loader2, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export interface DevotionShareButtonProps {
  onClick: () => void;
  isSharing?: boolean;
}

/**
 * DevotionShareButton — the AppBar share action (the Flutter
 * `shareFromSquare` IconButton). Presentational — the page wires `onClick` to
 * `useDevotionShare().share`.
 */
export function DevotionShareButton({
  onClick,
  isSharing = false,
}: DevotionShareButtonProps) {
  const t = useTranslations("devotion");
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={t("shareDevotion")}
      onClick={onClick}
      disabled={isSharing}
    >
      {isSharing ? (
        <Loader2 className="animate-spin" aria-hidden />
      ) : (
        <Share2 aria-hidden />
      )}
    </Button>
  );
}
