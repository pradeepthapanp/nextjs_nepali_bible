import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import en from "../messages/en.json";

/**
 * Technical SEO helper — the single place pages build their `Metadata`.
 *
 * Every page exposes `export const metadata = seo({ ... })` (static) or
 * `export async function generateMetadata(...)` (dynamic) using this helper,
 * so the canonical URL, OpenGraph, Twitter card, robots and `metadataBase`
 * stay consistent across the whole app.
 *
 * Descriptions reuse the EXISTING English nav copy from `messages/en.json`
 * (`nav.*Desc`) — no new content is invented.
 */

const BASE_URL = siteConfig.url.replace(/\/$/, "");
const DEFAULT_IMAGE = "/images/app-feature.png";

export interface SeoOptions {
  /** Page title (the root layout appends "| नेपाली बाइबल"). */
  title: string;
  description?: string;
  keywords?: string[];
  /** Canonical path, e.g. "/bible/10/1" (base is `NEXT_PUBLIC_SITE_URL`). */
  path: string;
  /** Exclude from search engines (auth / settings / profile / admin forms). */
  noindex?: boolean;
  /** Absolute or root-relative OG/Twitter image (defaults to the brand art). */
  image?: string;
}

/** The existing English section descriptions, reused verbatim as SEO copy. */
export const pageDescriptions = {
  home: en.nav.homeDesc,
  bible: en.nav.bibleDesc,
  music: en.nav.musicDesc,
  playlists: en.nav.playlistsDesc,
  articles: en.nav.articlesDesc,
  devotions: en.nav.devotionsDesc,
  maps: en.nav.mapsDesc,
  prayers: en.nav.prayersDesc,
  notices: en.nav.noticesDesc,
  quiz: en.nav.quizDesc,
} as const;

export function seo(options: SeoOptions): Metadata {
  const {
    title,
    description = siteConfig.description,
    keywords,
    path,
    noindex = false,
    image = DEFAULT_IMAGE,
  } = options;

  const url = `${BASE_URL}${path}`;
  const ogImage = image.startsWith("http") ? image : `${BASE_URL}${image}`;
  const fullTitle = `${title} | ${siteConfig.name}`;

  return {
    metadataBase: new URL(BASE_URL),
    title,
    description,
    keywords: [...(keywords ?? []), ...siteConfig.keywords],
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url,
      siteName: siteConfig.name,
      title: fullTitle,
      description,
      images: [{ url: ogImage, width: 1024, height: 500, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
