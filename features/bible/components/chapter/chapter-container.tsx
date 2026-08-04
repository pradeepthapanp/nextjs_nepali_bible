"use client";

import { cn } from "@/utils/cn";

export interface ChapterContainerProps {
  /** Rendered verse containers (already-parsed) for the chapter. */
  children: React.ReactNode;
  /** Selected version id, exposed as `data-version-id` (for audio/parallel sync). */
  dataVersionId?: string;
  className?: string;
}

/**
 * ChapterContainer — the chapter layout shell.
 *
 * Replaces the Flutter `single_chapter_display.dart` list body (a `ListView`
 * of `FullVerParse` rows). It is purely structural: it receives the already
 * rendered verse containers and applies the reading surface (max width, prose
 * rhythm) so every chapter shares the same layout.
 */
export function ChapterContainer({
  children,
  dataVersionId,
  className,
}: ChapterContainerProps) {
  return (
    <section
      aria-label="Chapter"
      data-version-id={dataVersionId}
      className={cn(
        "mx-auto w-full max-w-3xl space-y-3 px-0 py-4 text-foreground",
        className,
      )}
    >
      {children}
    </section>
  );
}
