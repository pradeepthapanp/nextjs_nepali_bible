import type { MetadataRoute } from "next";
import { createArticleServices } from "@/features/articles/services";
import { buildBibleUrl } from "@/features/bible/utils/deep-link";
import { createBibleServices } from "@/features/bible/services";
import { buildMapUrl } from "@/features/maps/utils/map-deep-link";
import { createMapServices } from "@/features/maps/services";
import { buildMusicUrl } from "@/features/music/utils/deep-link";
import { createMusicServices } from "@/features/music/services";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/site";

/** Base URL (no trailing slash) — from `NEXT_PUBLIC_SITE_URL`. */
const baseUrl = siteConfig.url.replace(/\/$/, "");
const now = new Date();

/**
 * Public, indexable section roots. Auth/settings/profile/account and all
 * editor (create/edit) routes are intentionally excluded (session-gated or
 * private). Individual playlists are excluded because `fetchPlaylists` is a
 * session-scoped query — there is no public playlist listing to enumerate.
 */
const staticRoutes: MetadataRoute.Sitemap = [
  { url: `${baseUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
  { url: `${baseUrl}/bible`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  { url: `${baseUrl}/audio-bible`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  { url: `${baseUrl}/music`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  { url: `${baseUrl}/music/artists`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
  { url: `${baseUrl}/songs`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  { url: `${baseUrl}/articles`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  { url: `${baseUrl}/devotion`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
  { url: `${baseUrl}/maps`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  { url: `${baseUrl}/prayers`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
  { url: `${baseUrl}/notices`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
  { url: `${baseUrl}/quiz`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  { url: `${baseUrl}/quiz/play`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
];

/** Sitemap entry builder for a public path (keeps `lastModified` optional). */
function entry(
  path: string,
  meta: {
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    lastModified?: Date | string;
  },
): MetadataRoute.Sitemap[number] {
  return {
    url: `${baseUrl}${path}`,
    lastModified: meta.lastModified ?? now,
    priority: meta.priority,
    changeFrequency: meta.changeFrequency,
  };
}

/** Dedupes entries by URL, preserving first occurrence (stable for DB). */
function dedupe(entries: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
  const seen = new Set<string>();
  return entries.filter((e) => (seen.has(e.url) ? false : (seen.add(e.url), true)));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [...staticRoutes];

  // Bible books + chapters (canonical, stable — ~1,189 chapters).
  try {
    const { bible } = createBibleServices(await createClient());
    const books = await bible.getBooks();
    for (const book of books) {
      entries.push(
        entry(buildBibleUrl({ kind: "book", bookNumber: book.bookNumber }), {
          priority: 0.9,
          changeFrequency: "weekly",
        }),
      );
      for (let chapter = 1; chapter <= book.chapters; chapter++) {
        entries.push(
          entry(
            buildBibleUrl({
              kind: "chapter",
              bookNumber: book.bookNumber,
              chapter,
            }),
            { priority: 0.7, changeFrequency: "weekly" },
          ),
        );
      }
    }
  } catch {
    // Bible data unavailable — keep static roots only.
  }

  // Articles (published only, paginated newest-first).
  try {
    const { article } = createArticleServices(await createClient());
    const PAGE_SIZE = 100;
    for (let offset = 0; ; offset += PAGE_SIZE) {
      const articles = await article.getArticles({ limit: PAGE_SIZE, offset });
      if (articles.length === 0) break;
      for (const a of articles) {
        if (!a.published) continue;
        entries.push(
          entry(`/articles/${a.id}`, {
            priority: 0.6,
            changeFrequency: "weekly",
            lastModified: a.updatedAt || a.createdAt,
          }),
        );
      }
      if (articles.length < PAGE_SIZE) break;
    }
  } catch {
    // Articles unavailable — continue.
  }

  // Songs + artists (songs paginated; artists one-shot).
  try {
    const { song, artist } = createMusicServices(await createClient());
    const PAGE_SIZE = 100;
    for (let page = 0; ; page++) {
      const songs = await song.getSongs(page, PAGE_SIZE);
      if (songs.length === 0) break;
      for (const s of songs) {
        if (!s.id || !s.name) continue;
        entries.push(
          entry(buildMusicUrl({ kind: "song", songId: s.id }), {
            priority: 0.6,
            changeFrequency: "weekly",
            lastModified: s.lastUpdated,
          }),
        );
      }
      if (songs.length < PAGE_SIZE) break;
    }
    const artists = await artist.getAllArtists();
    for (const ar of artists) {
      entries.push(
        entry(buildMusicUrl({ kind: "artist", artistId: ar.id }), {
          priority: 0.5,
          changeFrequency: "monthly",
          lastModified: ar.lastUpdated,
        }),
      );
    }
  } catch {
    // Music data unavailable — continue.
  }

  // Maps: topic lists + individual map viewers.
  try {
    const { map } = createMapServices(await createClient());
    const topics = await map.getTopics();
    for (const topic of topics) {
      entries.push(
        entry(buildMapUrl({ kind: "list", topic }), {
          priority: 0.5,
          changeFrequency: "monthly",
        }),
      );
      const maps = await map.getMapsByTopic(topic);
      for (const m of maps) {
        entries.push(
          entry(buildMapUrl({ kind: "view", mapId: m.id }), {
            priority: 0.5,
            changeFrequency: "monthly",
            lastModified: m.createdAt,
          }),
        );
      }
    }
  } catch {
    // Maps data unavailable — continue.
  }

  return dedupe(entries);
}
