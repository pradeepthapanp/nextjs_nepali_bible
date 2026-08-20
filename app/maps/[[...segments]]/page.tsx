import type { Metadata } from "next";
import { Suspense } from "react";
import { MapRouteDispatcher } from "@/features/maps/pages/map-route-dispatcher";
import { createMapServices } from "@/features/maps/services";
import { cleanMapTitle, deriveMapDescription } from "@/features/maps/utils";
import { parseMapPath } from "@/features/maps/utils/map-deep-link";
import { JsonLd } from "@/components/json-ld";
import {
  breadcrumbListGraph,
  collectionPageGraph,
  imageObjectGraph,
  type JsonLdGraph,
} from "@/lib/json-ld";
import { createClient } from "@/lib/supabase/server";
import { pageDescriptions, seo } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}): Promise<Metadata> {
  const { segments = [] } = await params;
  const pathname = `/maps/${segments.join("/")}`;
  const link = parseMapPath(pathname);

  if (link?.kind === "view") {
    const path = `/maps/view/${link.mapId}`;
    try {
      const services = createMapServices(await createClient());
      const map = await services.map.getMapById(link.mapId);
      if (map?.title) {
        const title = cleanMapTitle(map.title);
        return seo({
          title,
          // Derived from the map's EXISTING title + topic — never invented.
          description: deriveMapDescription(map),
          path,
        });
      }
    } catch {
      // Fall through to a generic Map title.
    }
    return seo({ title: "Map", description: pageDescriptions.maps, path });
  }

  return seo({ title: "Maps", description: pageDescriptions.maps, path: "/maps" });
}

/** ImageObject for a map view / CollectionPage for the list surfaces. */
async function mapJsonLd(segments: string[]): Promise<JsonLdGraph[] | null> {
  const pathname = `/maps/${segments.join("/")}`;
  const link = parseMapPath(pathname);

  if (link?.kind === "view") {
    const path = `/maps/view/${link.mapId}`;
    try {
      const services = createMapServices(await createClient());
      const map = await services.map.getMapById(link.mapId);
      if (map?.title) {
        const title = cleanMapTitle(map.title);
        return [
          imageObjectGraph({
            title,
            contentUrl: map.imageUrl,
            path,
          }),
          breadcrumbListGraph([
            { name: "Maps", path: "/maps" },
            { name: title, path },
          ]),
        ];
      }
    } catch {
      // Fall through — no structured data for an unresolvable map.
    }
    return null;
  }

  return [
    collectionPageGraph({
      title: "Maps",
      description: pageDescriptions.maps,
      path: "/maps",
    }),
  ];
}

/**
 * Maps route — the mount point for the Maps section.
 *
 * A single optional catch-all covers every deep-link shape handled by
 * `parseMapPath`:
 *   /maps                    → topics
 *   /maps/topic/{topic}      → maps list (topic URL-encoded)
 *   /maps/view/{mapId}       → full-screen viewer
 * `MapRouteDispatcher` picks the page from the path; each page reads its own
 * params/data, so this page stays a thin server shell. `Suspense` keeps the
 * dispatcher safe for prerendered client rendering (mirrors the Articles /
 * Music routes).
 */
export default async function MapsPage({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}) {
  const { segments = [] } = await params;
  const jsonLd = await mapJsonLd(segments);
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <Suspense fallback={null}>
        <MapRouteDispatcher />
      </Suspense>
    </>
  );
}
