import type { Metadata } from "next";
import { Suspense } from "react";
import { CommunityRouteDispatcher } from "@/features/community/components/community-route-dispatcher";
import { createCommunityServices } from "@/features/community/services";
import { parsePrayerPath } from "@/features/community/utils/deep-link";
import { JsonLd } from "@/components/json-ld";
import {
  articleGraph,
  breadcrumbListGraph,
  collectionPageGraph,
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
  const pathname = `/prayers/${segments.join("/")}`;
  const link = parsePrayerPath(pathname);

  if (link?.kind === "prayer") {
    const path = `/prayers/${link.id}`;
    try {
      const services = createCommunityServices(await createClient());
      const prayer = await services.prayer.getPrayer(link.id);
      if (prayer?.title) {
        return seo({
          title: prayer.title,
          description: prayer.details || prayer.title,
          path,
        });
      }
    } catch {
      // Fall through to a generic Prayer title.
    }
    return seo({ title: "Prayer", description: pageDescriptions.prayers, path });
  }

  if (link?.kind === "prayerNew" || link?.kind === "prayerEdit") {
    return seo({
      title: link.kind === "prayerNew" ? "New Prayer" : "Edit Prayer",
      path: pathname,
      noindex: true,
    });
  }

  return seo({ title: "Prayers", description: pageDescriptions.prayers, path: "/prayers" });
}

/** Article for a prayer detail / CollectionPage for the list. */
async function prayerJsonLd(segments: string[]): Promise<JsonLdGraph[] | null> {
  const pathname = `/prayers/${segments.join("/")}`;
  const link = parsePrayerPath(pathname);

  if (link?.kind === "prayer") {
    const path = `/prayers/${link.id}`;
    try {
      const services = createCommunityServices(await createClient());
      const prayer = await services.prayer.getPrayer(link.id);
      if (prayer?.title) {
        return [
          articleGraph({
            headline: prayer.title,
            description: prayer.details || prayer.title,
            path,
            datePublished: prayer.createdAt,
            author: prayer.isAnonymous ? undefined : prayer.authorName,
          }),
          breadcrumbListGraph([
            { name: "Prayers", path: "/prayers" },
            { name: prayer.title, path },
          ]),
        ];
      }
    } catch {
      // Fall through — no structured data for an unresolvable prayer.
    }
    return null;
  }

  if (!link || link.kind === "prayers") {
    // `!link` covers the list root when the catch-all path carries a trailing
    // slash (`/prayers/`) that `parsePrayerPath` doesn't match.
    return [
      collectionPageGraph({
        title: "Prayers",
        description: pageDescriptions.prayers,
        path: "/prayers",
      }),
    ];
  }

  return null; // new / edit — auth-gated forms.
}

/**
 * Prayers route — the mount point for the Prayers section.
 *
 * A single optional catch-all covers every deep-link shape handled by
 * `parsePrayerPath`:
 *   /prayers             → prayer requests list
 *   /prayers/{id}        → prayer detail
 *   /prayers/new         → create prayer
 *   /prayers/edit/{id}   → edit prayer
 * `CommunityRouteDispatcher` picks the page from the path; each page reads its
 * own params/data, so this page stays a thin server shell.
 * `Suspense` mirrors the other catch-all route shells.
 */
export default async function PrayersPage({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}) {
  const { segments = [] } = await params;
  const jsonLd = await prayerJsonLd(segments);
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <Suspense fallback={null}>
        <CommunityRouteDispatcher />
      </Suspense>
    </>
  );
}
