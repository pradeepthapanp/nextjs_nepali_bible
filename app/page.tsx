import type { Metadata } from "next";
import { HomePage } from "@/app/_components/home/home-page";
import { JsonLd } from "@/components/json-ld";
import {
  breadcrumbListGraph,
  organizationGraph,
  webSiteGraph,
} from "@/lib/json-ld";
import { siteConfig } from "@/lib/site";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: siteConfig.shortName,
  description: siteConfig.description,
  path: "/",
});

/**
 * Root route — the public landing page. Server shell that renders the
 * client `HomePage` (hero, quick access, today's devotion, recent
 * articles, featured music, community and footer).
 */
export default function Home() {
  return (
    <>
      <JsonLd
        data={[
          organizationGraph(),
          webSiteGraph(),
          breadcrumbListGraph([{ name: siteConfig.shortName, path: "/" }]),
        ]}
      />
      <HomePage />
    </>
  );
}

