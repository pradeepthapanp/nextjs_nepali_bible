"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/utils/cn";

export interface NoticeImageProps {
  src?: string;
  alt?: string;
  /** e.g. `aspect-video` (the Flutter 16:9 card image). */
  aspect?: string;
  className?: string;
}

/**
 * NoticeImage — the notice image with loading/error fallbacks (the web
 * equivalent of the `CachedNetworkImage` in the notice card/detail + the
 * broken-image fallback). Presentational. The status resets when `src` changes
 * via the render-phase "adjust state when props change" pattern (lint-clean).
 */
export function NoticeImage({
  src,
  alt = "",
  aspect = "aspect-video",
  className,
}: NoticeImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    src ? "loading" : "error",
  );
  if (src !== currentSrc) {
    setCurrentSrc(src);
    setStatus(src ? "loading" : "error");
  }

  if (!src) {
    return (
      <div
        className={cn(
          "grid place-items-center bg-muted text-muted-foreground",
          aspect,
          className,
        )}
      >
        <ImageOff className="size-8" aria-hidden />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-muted", aspect, className)}>
      {status === "loading" ? (
        <div className="absolute inset-0 grid place-items-center">
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element -- notice images come from the media CDN */}
      <img
        src={src}
        alt={alt}
        className="size-full object-cover"
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
      />
      {status === "error" ? (
        <div className="absolute inset-0 grid place-items-center bg-muted text-muted-foreground">
          <ImageOff className="size-8" aria-hidden />
        </div>
      ) : null}
    </div>
  );
}
