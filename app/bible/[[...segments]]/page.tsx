import type { Metadata } from "next";
import { Suspense } from "react";
import { BibleRouteDispatcher } from "@/features/bible/components/bible-route-dispatcher";
import { createBibleServices } from "@/features/bible/services";
import { buildBibleUrl, parseBibleUrl } from "@/features/bible/utils/deep-link";
import { JsonLd } from "@/components/json-ld";
import { bookGraph, type JsonLdGraph } from "@/lib/json-ld";
import { createClient } from "@/lib/supabase/server";
import { pageDescriptions, seo } from "@/lib/seo";

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
  if (typeof sp.v === "string") search.set("v", sp.v);
  if (typeof sp.verse === "string") search.set("verse", sp.verse);
  const pathname = `/bible/${segments.join("/")}`;
  const link = parseBibleUrl(pathname, search.toString());

  if (!link || link.kind === "search" || link.kind === "parallel") {
    return seo({ title: "Bible", description: pageDescriptions.bible, path: "/bible" });
  }

  const path = buildBibleUrl(link);

  try {
    const services = createBibleServices(await createClient());
    const [books, version] = await Promise.all([
      services.bible.getBooks(),
      link.versionId
        ? services.bible.getVersionById(link.versionId)
        : Promise.resolve(null),
    ]);
    const book = books.find((entry) => entry.bookNumber === link.bookNumber);
    const bookName = book?.longName ?? `पुस्तक ${link.bookNumber}`;
    const versionName = version?.name;

    if (link.kind === "chapter" || link.kind === "verse") {
      const title =
        link.kind === "verse"
          ? `${bookName} ${link.chapter}:${link.verse}`
          : `${bookName} ${link.chapter}`;
      return seo({
        title,
        description: `${bookName} — ${pageDescriptions.bible}`,
        keywords: versionName ? [versionName] : undefined,
        path,
      });
    }

    return seo({ title: bookName, description: pageDescriptions.bible, path });
  } catch {
    return seo({ title: "Bible", description: pageDescriptions.bible, path });
  }
}
/** Book structured data for the book/chapter/verse reader surface. */
async function bibleJsonLd(
  segments: string[],
  search: URLSearchParams,
): Promise<JsonLdGraph[] | null> {
  const pathname = `/bible/${segments.join("/")}`;
  const link = parseBibleUrl(pathname, search.toString());
  if (!link || link.kind === "search" || link.kind === "parallel") return null;
  const path = buildBibleUrl(link);
  try {
    const services = createBibleServices(await createClient());
    const books = await services.bible.getBooks();
    const book = books.find((entry) => entry.bookNumber === link.bookNumber);
    const bookName = book?.longName ?? `पुस्तक ${link.bookNumber}`;
    return [
      bookGraph({
        name: bookName,
        description: `${bookName} — ${pageDescriptions.bible}`,
        path,
      }),
    ];
  } catch {
    return null;
  }
}
/**
 * Bible route — the mount point for the reader and search.
 *
 * A single catch-all route covers the deep-link shapes handled by
 * `parseBibleUrl` (`/bible`, `/bible/{book}`, `/bible/{book}/{chapter}`,
 * `/bible/search`). `BibleRouteDispatcher` routes `/bible/search` to the
 * Search feature and everything else to `BibleHome`; both read the
 * path/search params themselves, so this page stays a thin server shell.
 * `Suspense` is required because the children use `useSearchParams`
 * (via `useDeepLink`) and this page is prerendered.
 */
export default async function BiblePage({
  params,
  searchParams,
}: {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { segments = [] } = await params;
  const sp = await searchParams;
  const search = new URLSearchParams();
  if (typeof sp.v === "string") search.set("v", sp.v);
  if (typeof sp.verse === "string") search.set("verse", sp.verse);
  const jsonLd = await bibleJsonLd(segments, search);
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <Suspense fallback={null}>
        <BibleRouteDispatcher />
      </Suspense>
    </>
  );
}
