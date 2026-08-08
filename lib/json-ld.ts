import { siteConfig } from "@/lib/site";

/**
 * JSON-LD structured-data builders — pure functions returning serializable
 * schema.org graphs. Every value comes from `siteConfig` or the page's own
 * real data; nothing is invented. Rendered via the shared `JsonLd` server
 * component (`components/json-ld.tsx`).
 */

export type JsonLdGraph = Record<string, unknown>;

const BASE_URL = siteConfig.url.replace(/\/$/, "");

/** Resolves a root-relative path (or an already-absolute URL) to an absolute URL. */
function absolute(path: string): string {
  return path.startsWith("http") ? path : `${BASE_URL}${path}`;
}

/** Organization — the app's publisher/creator. */
export function organizationGraph(): JsonLdGraph {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name: siteConfig.name,
    url: BASE_URL,
    logo: absolute("/logo/app-icon.png"),
  };
}

/** WebSite — the site-level node (links to the Organization). */
export function webSiteGraph(): JsonLdGraph {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    url: BASE_URL,
    name: siteConfig.name,
    description: siteConfig.description,
    publisher: { "@id": `${BASE_URL}/#organization` },
  };
}

/** BreadcrumbList — navigation trail for a page. */
export function breadcrumbListGraph(
  items: { name: string; path: string }[],
): JsonLdGraph {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absolute(item.path),
    })),
  };
}

/** CollectionPage — a listing surface (articles / songs / maps / prayers…). */
export function collectionPageGraph(options: {
  title: string;
  description?: string;
  path: string;
}): JsonLdGraph {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: options.title,
    url: absolute(options.path),
    ...(options.description ? { description: options.description } : {}),
  };
}

/** Article — an article / devotion / prayer / notice entry. */
export function articleGraph(options: {
  headline: string;
  description?: string;
  path: string;
  image?: string;
  datePublished?: string;
  author?: string;
  keywords?: string[];
}): JsonLdGraph {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: options.headline,
    url: absolute(options.path),
    ...(options.description ? { description: options.description } : {}),
    ...(options.image ? { image: absolute(options.image) } : {}),
    ...(options.datePublished ? { datePublished: options.datePublished } : {}),
    ...(options.author
      ? { author: { "@type": "Person", name: options.author } }
      : {}),
    ...(options.keywords && options.keywords.length > 0
      ? { keywords: options.keywords }
      : {}),
  };
}

/** MusicComposition — a worship/gospel song. */
export function musicCompositionGraph(options: {
  title: string;
  description?: string;
  path: string;
  artist?: string;
  image?: string;
}): JsonLdGraph {
  return {
    "@context": "https://schema.org",
    "@type": "MusicComposition",
    name: options.title,
    url: absolute(options.path),
    ...(options.description ? { description: options.description } : {}),
    ...(options.artist
      ? { composer: { "@type": "Person", name: options.artist } }
      : {}),
    ...(options.image ? { image: absolute(options.image) } : {}),
  };
}

/** Book — a Bible book / chapter (the reader surface). */
export function bookGraph(options: {
  name: string;
  description?: string;
  path: string;
  image?: string;
}): JsonLdGraph {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: options.name,
    url: absolute(options.path),
    ...(options.description ? { description: options.description } : {}),
    ...(options.image ? { image: absolute(options.image) } : {}),
  };
}

/** ImageObject — a map image (full media URL). */
export function imageObjectGraph(options: {
  title: string;
  contentUrl: string;
  path: string;
}): JsonLdGraph {
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    name: options.title,
    contentUrl: absolute(options.contentUrl),
    url: absolute(options.path),
  };
}
