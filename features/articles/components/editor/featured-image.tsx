"use client";

import { ImageIcon } from "lucide-react";
import { ARTICLE_FEATURED_IMAGE_FALLBACK } from "../../constants";
import { cn } from "@/utils/cn";

export interface FeaturedImageProps {
  src?: string;
  alt?: string;
  className?: string;
  /** Image fill behavior (the hero uses cover; the uploader preview uses contain). */
  fit?: "cover" | "contain";
}

/**
 * FeaturedImage — renders an article's featured image with the shared
 * placeholder fallback (Flutter's `church_placeholder.png`, see
 * `ARTICLE_FEATURED_IMAGE_FALLBACK`). Used by `ArticleHeader` (hero) and
 * `ImageUploader` (preview). Presentational.
 */
export function FeaturedImage({
  src,
  alt = "",
  className,
  fit = "cover",
}: FeaturedImageProps) {
  const imageSrc = src && src.length > 0 ? src : ARTICLE_FEATURED_IMAGE_FALLBACK;
  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={alt}
        className={cn("h-full w-full", fit === "cover" ? "object-cover" : "object-contain")}
        loading="lazy"
        onError={(event) => {
          // Fall back to the placeholder if the URL is broken.
          if (event.currentTarget.src !== ARTICLE_FEATURED_IMAGE_FALLBACK) {
            event.currentTarget.src = ARTICLE_FEATURED_IMAGE_FALLBACK;
          }
        }}
      />
      {!src ? (
        <span className="pointer-events-none absolute inset-0 grid place-items-center text-muted-foreground/50">
          <ImageIcon className="size-8" aria-hidden />
        </span>
      ) : null}
    </div>
  );
}
