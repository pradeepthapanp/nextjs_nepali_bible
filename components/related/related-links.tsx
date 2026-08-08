"use client";

import Link from "next/link";
import { ArrowRight, Link2 } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * A single internal related link (real `<a>` — crawler-followable).
 */
export interface RelatedLinkItem {
  /** Absolute-in-app path, e.g. `/bible/1/1` (no base URL). */
  href: string;
  /** Primary label, e.g. "उत्पत्ति 1" or a song/artist name. */
  label: string;
  /** Optional secondary line, e.g. "Article" / a category label. */
  description?: string;
}

export interface RelatedLinksProps {
  /** Section heading, e.g. "Related Bible chapter". */
  title: string;
  links: RelatedLinkItem[];
  className?: string;
}

/**
 * RelatedLinks — a lightweight, data-driven internal-linking section.
 *
 * Renders a heading + the related links as `<Link>` pills (real anchors for
 * crawlers). It is intentionally presentational: callers derive the links from
 * EXISTING metadata (article `relatedBookNumber`/`relatedChapter`, song
 * `artistId`/`category`, …) and never fabricate relationships. Returns `null`
 * when there is nothing to link, so pages stay clean when no relation exists.
 */
export function RelatedLinks({ title, links, className }: RelatedLinksProps) {
  const visible = links.filter(
    (link) => link.href && link.label && link.href !== "#",
  );
  if (visible.length === 0) return null;

  return (
    <section aria-label={title} className={cn("mt-8", className)}>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
        <Link2 className="size-4 text-muted-foreground" aria-hidden />
        {title}
      </h2>
      <ul className="flex flex-col gap-2">
        {visible.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group flex items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2 text-sm transition-colors hover:bg-accent"
            >
              <span className="min-w-0">
                <span className="block truncate font-medium text-foreground">
                  {link.label}
                </span>
                {link.description ? (
                  <span className="block truncate text-xs text-muted-foreground">
                    {link.description}
                  </span>
                ) : null}
              </span>
              <ArrowRight
                className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
