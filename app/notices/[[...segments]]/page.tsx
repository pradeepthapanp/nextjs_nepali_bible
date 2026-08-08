import type { Metadata } from "next";
import { Suspense } from "react";
import { CommunityRouteDispatcher } from "@/features/community/components/community-route-dispatcher";
import { createCommunityServices } from "@/features/community/services";
import { parseNoticePath } from "@/features/community/utils/deep-link";
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
  const pathname = `/notices/${segments.join("/")}`;
  const link = parseNoticePath(pathname);

  if (link?.kind === "notice") {
    const path = `/notices/${link.id}`;
    try {
      const services = createCommunityServices(await createClient());
      const notice = await services.notice.getNotice(link.id);
      if (notice?.title) {
        return seo({
          title: notice.title,
          description: notice.description || notice.title,
          path,
        });
      }
    } catch {
      // Fall through to a generic Notice title.
    }
    return seo({ title: "Notice", description: pageDescriptions.notices, path });
  }

  if (link?.kind === "noticeNew" || link?.kind === "noticeEdit") {
    return seo({
      title: link.kind === "noticeNew" ? "New Notice" : "Edit Notice",
      path: pathname,
      noindex: true,
    });
  }

  return seo({ title: "Notices", description: pageDescriptions.notices, path: "/notices" });
}

/** Article for a notice detail / CollectionPage for the list. */
async function noticeJsonLd(segments: string[]): Promise<JsonLdGraph[] | null> {
  const pathname = `/notices/${segments.join("/")}`;
  const link = parseNoticePath(pathname);

  if (link?.kind === "notice") {
    const path = `/notices/${link.id}`;
    try {
      const services = createCommunityServices(await createClient());
      const notice = await services.notice.getNotice(link.id);
      if (notice?.title) {
        return [
          articleGraph({
            headline: notice.title,
            description: notice.description || notice.title,
            path,
            datePublished: notice.createdAt,
            image: notice.imageUrl,
          }),
          breadcrumbListGraph([
            { name: "Notices", path: "/notices" },
            { name: notice.title, path },
          ]),
        ];
      }
    } catch {
      // Fall through — no structured data for an unresolvable notice.
    }
    return null;
  }

  if (!link || link.kind === "notices") {
    // `!link` covers the list root when the catch-all path carries a trailing
    // slash (`/notices/`) that `parseNoticePath` doesn't match.
    return [
      collectionPageGraph({
        title: "Notices",
        description: pageDescriptions.notices,
        path: "/notices",
      }),
    ];
  }

  return null; // new / edit — auth-gated forms.
}

/**
 * Notices route — the mount point for the Notices section.
 *
 * A single optional catch-all covers every deep-link shape handled by
 * `parseNoticePath`:
 *   /notices             → notices list
 *   /notices/{id}        → notice detail
 *   /notices/new         → create notice
 *   /notices/edit/{id}   → edit notice
 * `CommunityRouteDispatcher` picks the page from the path; each page reads its
 * own params/data, so this page stays a thin server shell.
 * `Suspense` mirrors the other catch-all route shells.
 */
export default async function NoticesPage({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}) {
  const { segments = [] } = await params;
  const jsonLd = await noticeJsonLd(segments);
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <Suspense fallback={null}>
        <CommunityRouteDispatcher />
      </Suspense>
    </>
  );
}
