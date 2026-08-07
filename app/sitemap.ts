import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

/** Base URL (no trailing slash) — from `NEXT_PUBLIC_SITE_URL`. */
const baseUrl = siteConfig.url.replace(/\/$/, "");

/**
 * Public, indexable routes. Auth/settings-account/profile are intentionally
 * excluded (session-gated). Maps/quiz sub-routes are reachable from their list
 * pages, so the section roots are enough here.
 */
const routes = [
  "/",
  "/bible",
  "/audio-bible",
  "/music",
  "/playlists",
  "/songs",
  "/articles",
  "/devotion",
  "/maps",
  "/prayers",
  "/notices",
  "/quiz",
  "/settings",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1 : 0.8,
  }));
}
