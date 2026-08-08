import type { Metadata } from "next";
import { TodaysDevotionPage } from "@/features/devotions/components/todays-devotion-page";
import { DEVOTION_HEADING } from "@/features/devotions/constants";
import { createDevotionServices } from "@/features/devotions/services";
import { JsonLd } from "@/components/json-ld";
import { articleGraph, type JsonLdGraph } from "@/lib/json-ld";
import { createClient } from "@/lib/supabase/server";
import { pageDescriptions, seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Devotion",
  description: pageDescriptions.devotions,
  path: "/devotion",
});

/** Article structured data for today's devotion (real row). */
async function devotionJsonLd(): Promise<JsonLdGraph[] | null> {
  try {
    const services = createDevotionServices(await createClient());
    const devotion = await services.devotion.getDailyDevotion();
    if (!devotion) return null;
    return [
      articleGraph({
        headline: DEVOTION_HEADING,
        description: pageDescriptions.devotions,
        path: "/devotion",
        datePublished: devotion.createdAt,
      }),
    ];
  } catch {
    return null;
  }
}

/**
 * Devotion route — the Today's Devotion page (PUBLIC, single route).
 *
 * A thin server shell mounting the client page. Because there is exactly ONE
 * devotion route, no catch-all and no route dispatcher are required (unlike
 * Maps/Articles/Music/Community). The page reads its own data/deep links.
 */
export default async function DevotionPage() {
  const jsonLd = await devotionJsonLd();
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <TodaysDevotionPage />
    </>
  );
}
