/**
 * Central site identity and SEO configuration.
 *
 * This file is the single source of truth for anything that describes the
 * application itself (name, description, URLs, author, keywords). The root
 * layout imports these values to build `metadata`/`viewport`, so branding
 * lives in exactly one place.
 */

export const siteConfig = {
  name: "Nepali Bible",
  shortName: "Nepali Bible",
  description:
    "नेपाली भाषामा बाइबल पढ्नुहोस्, सुन्नुहोस् र अध्ययन गर्नुहोस्। Read, listen and study the Bible in Nepali.",
  author: "Nepali Bible Web",
  locale: "ne_NP",
  /** Resolved from `NEXT_PUBLIC_SITE_URL` (see `.env.example`). */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  keywords: [
    "nepali bible",
    "bible",
    "nepali",
    "bible app",
    "bible study",
    "बाइबल",
    "नेपाली बाइबल",
    "devotion",
    "worship",
    "music",
  ],
  /** Social / project links — extend during feature migration. */
  links: {
    github: "https://github.com/",
  },
} satisfies SiteConfig;

export type SiteConfig = {
  name: string;
  shortName: string;
  description: string;
  author: string;
  locale: string;
  url: string;
  keywords: string[];
  links: { github: string };
};
