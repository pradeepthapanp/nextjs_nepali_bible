import type { Metadata } from "next";
import { Suspense } from "react";
import { MusicRouteDispatcher } from "@/features/music/components/music-route-dispatcher";
import { createMusicServices } from "@/features/music/services";
import { parseMusicUrl } from "@/features/music/utils/deep-link";
import { JsonLd } from "@/components/json-ld";
import {
  collectionPageGraph,
  musicCompositionGraph,
  type JsonLdGraph,
} from "@/lib/json-ld";
import { createClient } from "@/lib/supabase/server";
import { pageDescriptions, seo } from "@/lib/seo";
import { deriveSongDescription } from "@features/music/utils";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { segments = [] } = await params;
  const sp = await searchParams;
  const search = new URLSearchParams();
  if (typeof sp.q === "string") search.set("q", sp.q);
  if (typeof sp.category === "string") search.set("category", sp.category);
  const pathname = `/music/${segments.join("/")}`;
  const link = parseMusicUrl(pathname, search.toString());

  if (link?.kind === "song") {
    const path = `/music/song/${link.songId}`;
    try {
      const services = createMusicServices(await createClient());
      const song = await services.song.getSongById(link.songId);
      if (song?.name) {
        return seo({
          title: song.name,
          // Derived from EXISTING content (lyrics/metadata) — never invented.
          description: deriveSongDescription(song),
          keywords: song.artist ? [song.artist] : undefined,
          path,
        });
      }
    } catch {
      // Fall through to the generic Music metadata.
    }
    return seo({ title: "Music", description: pageDescriptions.music, path });
  }

  return seo({ title: "Music", description: pageDescriptions.music, path: "/music" });
}

/** MusicComposition for a song / CollectionPage for the list surfaces. */
async function musicJsonLd(
  segments: string[],
  search: URLSearchParams,
): Promise<JsonLdGraph[] | null> {
  const pathname = `/music/${segments.join("/")}`;
  const link = parseMusicUrl(pathname, search.toString());

  if (link?.kind === "song") {
    const path = `/music/song/${link.songId}`;
    try {
      const services = createMusicServices(await createClient());
      const song = await services.song.getSongById(link.songId);
      if (song?.name) {
        return [
          musicCompositionGraph({
            title: song.name,
            description: deriveSongDescription(song),
            path,
            artist: song.artist,
          }),
        ];
      }
    } catch {
      // Fall through — no structured data for an unresolvable song.
    }
    return null;
  }

  return [
    collectionPageGraph({
      title: pageDescriptions.music,
      description: pageDescriptions.music,
      path: "/music",
    }),
  ];
}

/**
 * Music route — the mount point for the song list and the song reader.
 *
 * A single catch-all route covers every deep-link shape handled by
 * `parseMusicUrl` (`/music`, `/music/song/{id}`, `/music/category/{category}`,
 * `/music/search`, `/music/artist/{id}`, playlists/artists/chords).
 * `MusicRouteDispatcher` routes `/music/song/{id}` to the Song Reader and
 * everything else to `MusicHome`; both read the path/search params themselves,
 * so this page stays a thin server shell.
 * `Suspense` is required because the children use `useSearchParams`
 * (via `useMusicDeepLink`) and this page is prerendered.
 */
export default async function MusicPage({
  params,
  searchParams,
}: {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { segments = [] } = await params;
  const sp = await searchParams;
  const search = new URLSearchParams();
  if (typeof sp.q === "string") search.set("q", sp.q);
  if (typeof sp.category === "string") search.set("category", sp.category);
  const jsonLd = await musicJsonLd(segments, search);
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <Suspense fallback={null}>
        <MusicRouteDispatcher />
      </Suspense>
    </>
  );
}
