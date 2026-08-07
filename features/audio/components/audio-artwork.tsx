"use client";

import { useState } from "react";
import { Music } from "lucide-react";
import { cn } from "@/utils/cn";

export interface AudioArtworkProps {
  src?: string;
  alt?: string;
  /** Sizing/shape via className (e.g. `size-12 rounded-lg`). */
  className?: string;
}

/**
 * AudioArtwork — the cover/artwork thumbnail of an `AudioItem` (the web
 * replacement of Flutter's `ArtworkWidget` in
 * `lib/audios/widgets/audio_image_widget.dart`: an image with a placeholder
 * fallback). Purely presentational; `src` comes from the current item.
 *
 * The fallback state resets via the React render-phase adjustment pattern
 * (storing the previous src) so a new item's artwork never shows the previous
 * item's failed state.
 */
export function AudioArtwork({ src, alt, className }: AudioArtworkProps) {
  const [failed, setFailed] = useState(false);
  const [previousSrc, setPreviousSrc] = useState(src);
  if (src !== previousSrc) {
    setPreviousSrc(src);
    setFailed(false);
  }

  if (!src || failed) {
    return (
      <div
        className={cn(
          "grid shrink-0 place-items-center bg-muted text-muted-foreground",
          className,
        )}
        aria-hidden
      >
        <Music className="size-1/2" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? ""}
      onError={() => setFailed(true)}
      className={cn("shrink-0 object-cover", className)}
    />
  );
}
